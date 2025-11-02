import { Disciplina } from "./Disciplina";

export enum TipoProfessor {
  PROFESSOR = 'PROFESSOR',
  COORDENADOR = 'COORDENADOR',
}

export interface Professor {
  id: number;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoProfessor;
  disciplinas: Disciplina[];
}
