import { Alternativa } from "./Alternativa";


export interface Pergunta {
  id: number;
  conteudo: string;
  nomeProfessor: string;
  alternativas: Alternativa[];
}
