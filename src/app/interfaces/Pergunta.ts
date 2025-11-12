import { Alternativa } from './Alternativa';

export interface Pergunta {
  id: number;
  enunciado: string;
  codigoProfessor: number;
  alternativas: Alternativa[];
  disciplinaId: number;
}
