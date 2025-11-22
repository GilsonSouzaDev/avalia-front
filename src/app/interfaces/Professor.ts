import { Disciplina } from "./Disciplina";

export enum TipoProfessor {
  PROFESSOR = 'PROFESSOR',
  COORDENADOR = 'COORDENADOR',
}

export interface Professor {
  id?: number;
  codigo: number;
  nome: string;
  email: string;
  perfilProfessor: TipoProfessor;
  senha?: string;
  disciplinas?: Disciplina[]; // Podemos tipar melhor depois se precisar
}
