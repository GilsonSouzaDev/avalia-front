import { Disciplina } from '../interfaces/Disciplina';
import { TipoProfessor } from '../interfaces/Professor';

export const DISCIPLINAS_MOCK: Disciplina[] = [
  {
    id: 1,
    nome: 'Banco de Dados',
    professores: [
      {
        id: 1,
        nome: 'Prof. Carlos Mendes',
        email: 'carlos.mendes@escola.com',
        senha: '',
        tipo: TipoProfessor.PROFESSOR,
        disciplinas: [],
      },
    ],
    perguntas: [
      {
        id: 101,
        enunciado:
          'Qual comando SQL é usado para selecionar dados de uma tabela?',
        nomeProfessor: 'Prof. Carlos Mendes',
        alternativas: [
          { id: 1, texto: 'SELECT' },
          { id: 2, texto: 'INSERT' },
          { id: 3, texto: 'UPDATE' },
          { id: 4, texto: 'DELETE' },
        ],
      },
      {
        id: 102,
        enunciado:
          'Qual comando é usado para adicionar uma nova linha em uma tabela?',
        nomeProfessor: 'Prof. Carlos Mendes',
        alternativas: [
          { id: 5, texto: 'ADD ROW' },
          { id: 6, texto: 'INSERT INTO' },
          { id: 7, texto: 'UPDATE' },
          { id: 8, texto: 'ALTER TABLE' },
        ],
      },
      {
        id: 103,
        enunciado: 'O que significa a sigla SQL?',
        nomeProfessor: 'Prof. Carlos Mendes',
        alternativas: [
          { id: 9, texto: 'Structured Query Language' },
          { id: 10, texto: 'Simple Query Language' },
          { id: 11, texto: 'Standard Question Language' },
          { id: 12, texto: 'System Query Logic' },
        ],
      },
      {
        id: 104,
        enunciado: 'Qual comando remove permanentemente uma tabela?',
        nomeProfessor: 'Prof. Carlos Mendes',
        alternativas: [
          { id: 13, texto: 'DROP TABLE' },
          { id: 14, texto: 'DELETE TABLE' },
          { id: 15, texto: 'REMOVE TABLE' },
          { id: 16, texto: 'CLEAR TABLE' },
        ],
      },
    ],
  },
  {
    id: 2,
    nome: 'Front End',
    professores: [
      {
        id: 2,
        nome: 'Profa. Ana Beatriz',
        email: 'ana.beatriz@escola.com',
        senha: '',
        tipo: TipoProfessor.COORDENADOR,
        disciplinas: [],
      },
    ],
    perguntas: [
      {
        id: 201,
        enunciado: 'Qual linguagem é usada para estruturar páginas web?',
        nomeProfessor: 'Profa. Ana Beatriz',
        alternativas: [
          { id: 17, texto: 'HTML' },
          { id: 18, texto: 'CSS' },
          { id: 19, texto: 'JavaScript' },
          { id: 20, texto: 'PHP' },
        ],
      },
      {
        id: 202,
        enunciado: 'Qual propriedade CSS é usada para alterar a cor do texto?',
        nomeProfessor: 'Profa. Ana Beatriz',
        alternativas: [
          { id: 21, texto: 'font-color' },
          { id: 22, texto: 'text-color' },
          { id: 23, texto: 'color' },
          { id: 24, texto: 'text-style' },
        ],
      },
      {
        id: 203,
        enunciado: 'Qual framework JavaScript é mantido pelo Facebook?',
        nomeProfessor: 'Profa. Ana Beatriz',
        alternativas: [
          { id: 25, texto: 'React' },
          { id: 26, texto: 'Vue.js' },
          { id: 27, texto: 'Angular' },
          { id: 28, texto: 'Svelte' },
        ],
      },
      {
        id: 204,
        enunciado: 'O que significa a sigla CSS?',
        nomeProfessor: 'Profa. Ana Beatriz',
        alternativas: [
          { id: 29, texto: 'Creative Style System' },
          { id: 30, texto: 'Cascading Style Sheets' },
          { id: 31, texto: 'Computer Style Syntax' },
          { id: 32, texto: 'Color Styling System' },
        ],
      },
    ],
  },
  {
    id: 3,
    nome: 'Back End',
    professores: [
      {
        id: 3,
        nome: 'Prof. Renato Souza',
        email: 'renato.souza@escola.com',
        senha: '',
        tipo: TipoProfessor.PROFESSOR,
        disciplinas: [],
      },
    ],
    perguntas: [
      {
        id: 301,
        enunciado: 'Qual linguagem é mais usada no desenvolvimento back-end?',
        nomeProfessor: 'Prof. Renato Souza',
        alternativas: [
          { id: 33, texto: 'Python' },
          { id: 34, texto: 'HTML' },
          { id: 35, texto: 'CSS' },
          { id: 36, texto: 'React' },
        ],
      },
      {
        id: 302,
        enunciado: 'O que é uma API?',
        nomeProfessor: 'Prof. Renato Souza',
        alternativas: [
          { id: 37, texto: 'Um tipo de banco de dados' },
          { id: 38, texto: 'Um servidor físico' },
          { id: 39, texto: 'Uma interface para comunicação entre sistemas' },
          { id: 40, texto: 'Uma linguagem de programação' },
        ],
      },
      {
        id: 303,
        enunciado: 'Qual protocolo é mais usado para comunicação web?',
        nomeProfessor: 'Prof. Renato Souza',
        alternativas: [
          { id: 41, texto: 'FTP' },
          { id: 42, texto: 'SMTP' },
          { id: 43, texto: 'HTTP/HTTPS' },
          { id: 44, texto: 'SSH' },
        ],
      },
      {
        id: 304,
        enunciado:
          'Em Node.js, qual módulo é usado para criar um servidor HTTP?',
        nomeProfessor: 'Prof. Renato Souza',
        alternativas: [
          { id: 45, texto: 'http' },
          { id: 46, texto: 'fs' },
          { id: 47, texto: 'path' },
          { id: 48, texto: 'os' },
        ],
      },
    ],
  },
];
