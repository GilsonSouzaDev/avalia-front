import { Alternativa } from "./Alternativa";
import { Disciplina } from "./Disciplina";

export interface Pergunta {
  id: number;
  enunciado: string;
  codigoProfessor: number;
  disciplina: Disciplina;
  alternativas: Alternativa[];
}

export interface CadastrarPergunta {
  enunciado: string;
  disciplinaId: number;
  codigoProfessor: number;
  alternativas: { texto: string }[];
}
