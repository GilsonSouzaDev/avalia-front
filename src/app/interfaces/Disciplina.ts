import { Pergunta } from "./Pergunta";
import { Professor } from "./Professor";


export interface Disciplina {
  id: number;
  nome: string;
  professores: Professor[];
  perguntas: Pergunta[];
  cor?: string;

}
