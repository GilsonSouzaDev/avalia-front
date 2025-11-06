import { Alternativa } from "./Alternativa";


export interface Pergunta {
  id: number;
  enunciado: string;
  nomeProfessor: string;
  alternativas: Alternativa[];
}
