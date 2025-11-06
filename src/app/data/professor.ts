import { Professor, TipoProfessor } from '../interfaces/Professor';
import { Disciplina } from '../interfaces/Disciplina';

export const PROFESSORES_MOCK: Professor[] = [
  {
    id: 1,
    nome: 'Prof. Carlos Mendes',
    email: 'carlos.mendes@escola.com',
    senha: '',
    tipo: TipoProfessor.PROFESSOR,
    disciplinas: [
      {
        id: 1,
        nome: 'Banco de Dados',
        professores: [],
        perguntas: [],
      } as Disciplina,
    ],
  },
  {
    id: 2,
    nome: 'Profa. Ana Beatriz',
    email: 'ana.beatriz@escola.com',
    senha: '',
    tipo: TipoProfessor.COORDENADOR,
    disciplinas: [
      {
        id: 2,
        nome: 'Front End',
        professores: [],
        perguntas: [],
      } as Disciplina,
    ],
  },
  {
    id: 3,
    nome: 'Prof. Renato Souza',
    email: 'renato.souza@escola.com',
    senha: '',
    tipo: TipoProfessor.PROFESSOR,
    disciplinas: [
      { id: 3, nome: 'Back End', professores: [], perguntas: [] } as Disciplina,
    ],
  },
];
