import { Alternativa } from "../interfaces/Alternativa";
import { CadastrarPergunta, Pergunta } from "../interfaces/Pergunta";


export class PerguntaFormUtils {

  /**
   * Cria um array inicial de alternativas vazias.
   */
  static gerarAlternativasIniciais(total: number = 5): Alternativa[] {
    return Array(total).fill(null).map(() => ({
      texto: '',
      correta: false
    } as Alternativa));
  }

  /**
   * Ajusta o tamanho do array (cresce ou corta) baseado na seleção (4 ou 5).
   */
  static ajustarQuantidadeAlternativas(
    alternativasAtuais: Alternativa[],
    novaQuantidade: number
  ): Alternativa[] {
    const copia = [...alternativasAtuais];
    
    // Se precisar de mais, adiciona
    if (copia.length < novaQuantidade) {
      const faltam = novaQuantidade - copia.length;
      for (let i = 0; i < faltam; i++) {
        copia.push({ texto: '', correta: false } as Alternativa);
      }
    }
    // Nota: Não cortamos o array aqui para preservar dados caso o user volte para 5,
    // apenas ignoramos os excedentes na hora de validar/salvar.
    
    return copia;
  }

  /**
   * Garante a regra de exclusão mútua: Apenas o index selecionado vira True.
   */
  static definirUnicaCorreta(alternativas: Alternativa[], indexSelecionado: number): void {
    alternativas.forEach((alt, index) => {
      alt.correta = (index === indexSelecionado);
    });
  }

  /**
   * Valida se todas as visíveis estão preenchidas e se há uma correta.
   */
  static isFormularioValido(alternativas: Alternativa[], qtdVisivel: number): boolean {
    const visiveis = alternativas.slice(0, qtdVisivel);
    const todasPreenchidas = visiveis.every(a => !!(a.texto && a.texto.trim().length > 0));
    const temCorreta = visiveis.some(a => a.correta);
    
    return todasPreenchidas && temCorreta;
  }

  /**
   * Limpa e prepara o objeto para envio (Create ou Update).
   */
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

    // 1. Filtra e Limpa Alternativas
    const alternativasLimpas = alternativas
      .slice(0, qtdVisivel)
      .map(alt => {
        const obj: any = { texto: alt.texto, correta: alt.correta };
        if (alt.id) obj.id = alt.id; // Mantém ID apenas se existir
        return obj;
      });

    // 2. Monta Payload de EDIÇÃO
    if (isEdicao && perguntaEdicao) {
      return {
        ...perguntaEdicao,
        enunciado: enunciado,
        // Mantém a disciplina original ou atualiza se a lógica permitir
        disciplina: perguntaEdicao.disciplina, 
        alternativas: alternativasLimpas as Alternativa[],
        // Se imagemFile for null, o service não envia nada (mantém a antiga). 
        // Se tiver File, o service envia.
        imagem: imagemFile 
      } as unknown as Pergunta; // Cast para flexibilizar o campo imagem que no frontend é File temporariamente
    }

    // 3. Monta Payload de CRIAÇÃO
    if (!disciplinaId || !professorId) {
      return null; // Erro de validação
    }

    return {
      enunciado: enunciado,
      disciplinaId: disciplinaId,
      professorId: professorId,
      alternativas: alternativasLimpas,
      imagem: imagemFile // Passa o File, o Service converte pra FormData
    } as CadastrarPergunta;
  }
}