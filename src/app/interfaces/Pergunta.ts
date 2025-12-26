import { Alternativa } from "./Alternativa";
import { Disciplina } from "./Disciplina";

export interface Pergunta {
  id: number;
  enunciado: string;
  professorId: number;
  imagem: string | null;
  disciplina: Disciplina;
  alternativas: Alternativa[];
}

export interface CadastrarPergunta {
  enunciado: string;
  disciplinaId: number;
  imagem: string | null;
  professorId: number;
  alternativas: { texto: string }[];
}
