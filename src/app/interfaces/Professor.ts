import { Disciplina } from './Disciplina';

export enum TipoProfessor {
  PROFESSOR = 'PROFESSOR',
  COORDENADOR = 'COORDENADOR',
}

export interface Professor {
  id: number;
  codigo: number;
  nome: string;
  email: string;
  senha: string;
  perfilProfessor: TipoProfessor;
  disciplinas: Disciplina[];
}
