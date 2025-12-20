import { Disciplina } from "./Disciplina";
import { Pergunta } from "./Pergunta";

export enum TipoProfessor {
  PROFESSOR = 'PROFESSOR',
  COORDENADOR = 'COORDENADOR',
}

export interface Professor {
  id?: number;
  nome: string;
  email: string;
  perfilProfessor: TipoProfessor;
  senha?: string;
  disciplinas?: Disciplina[];
  perguntas?: Pergunta[];
}
