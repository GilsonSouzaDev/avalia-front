import { Alternativa } from "../interfaces/Alternativa";
import { CadastrarPergunta, Pergunta } from "../interfaces/Pergunta";

export class PerguntaFormUtils {

  static gerarAlternativasIniciais(total: number = 5): Alternativa[] {
    return Array(total).fill(null).map(() => ({
      texto: '',
      correta: false
    } as Alternativa));
  }

  static ajustarQuantidadeAlternativas(
    alternativasAtuais: Alternativa[],
    novaQuantidade: number
  ): Alternativa[] {
    const copia = [...alternativasAtuais];
    
    if (copia.length < novaQuantidade) {
      const faltam = novaQuantidade - copia.length;
      for (let i = 0; i < faltam; i++) {
        copia.push({ texto: '', correta: false } as Alternativa);
      }
    }
    
    return copia;
  }

  static definirUnicaCorreta(alternativas: Alternativa[], indexSelecionado: number): void {
    alternativas.forEach((alt, index) => {
      alt.correta = (index === indexSelecionado);
    });
  }

  static isFormularioValido(alternativas: Alternativa[], qtdVisivel: number): boolean {
    const visiveis = alternativas.slice(0, qtdVisivel);
    const todasPreenchidas = visiveis.every(a => !!(a.texto && a.texto.trim().length > 0));
    const temCorreta = visiveis.some(a => a.correta);
    
    return todasPreenchidas && temCorreta;
  }

  static montarPayload(params: {
    isEdicao: boolean;
    perguntaEdicao: Pergunta | null;
    enunciado: string;
    disciplinaId: number | null;
    professorId: number | null;
    alternativas: Alternativa[];
    qtdVisivel: number;
    imagemFile: File | null;
  }): CadastrarPergunta | Pergunta | null {

    const { 
      isEdicao, perguntaEdicao, enunciado, disciplinaId, 
      professorId, alternativas, qtdVisivel, imagemFile 
    } = params;

    const alternativasLimpas = alternativas
      .slice(0, qtdVisivel)
      .map(alt => {
        const obj: any = { texto: alt.texto, correta: alt.correta };
        if (alt.id) obj.id = alt.id;
        return obj;
      });

    if (isEdicao && perguntaEdicao) {
      const payload: any = {
        ...perguntaEdicao,
        enunciado: enunciado,
        disciplinaId: disciplinaId || perguntaEdicao.disciplina?.id,
        alternativas: alternativasLimpas,
        imagem: imagemFile 
      };

      delete payload.disciplina;

      return payload as unknown as Pergunta;
    }

    if (!disciplinaId || !professorId) {
      return null;
    }

    return {
      enunciado: enunciado,
      disciplinaId: disciplinaId,
      professorId: professorId,
      alternativas: alternativasLimpas,
      imagem: imagemFile
    } as CadastrarPergunta;
  }
}