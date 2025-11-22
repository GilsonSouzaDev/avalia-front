// src/app/mocks/mock-data.ts
/*
import { Alternativa } from '../interfaces/Alternativa';
import { Disciplina } from '../interfaces/Disciplina';
import { Pergunta } from '../interfaces/Pergunta';
import { Professor, TipoProfessor } from '../interfaces/Professor';

// --- MOCK DATA ---

// Professores (10 no total, incluindo 1 Coordenador)
const profAna: Professor = {
  id: 1,
  codigo: 1000,
  nome: 'Ana Coordenadora',
  email: 'ana@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.COORDENADOR,
  disciplinas: [],
};
const profBruno: Professor = {
  id: 2,
  codigo: 1001,
  nome: 'Bruno Matemática',
  email: 'bruno@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profCarla: Professor = {
  id: 3,
  codigo: 1002,
  nome: 'Carla História',
  email: 'carla@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profDavid: Professor = {
  id: 4,
  codigo: 1003,
  nome: 'David Geografia',
  email: 'david@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profEster: Professor = {
  id: 5,
  codigo: 1004,
  nome: 'Ester Inglês',
  email: 'ester@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profFelipe: Professor = {
  id: 6,
  codigo: 1005,
  nome: 'Felipe Química',
  email: 'felipe@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profGiovanna: Professor = {
  id: 7,
  codigo: 1006,
  nome: 'Giovanna Física',
  email: 'gio@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profHenrique: Professor = {
  id: 8,
  codigo: 1007,
  nome: 'Henrique Biologia',
  email: 'henrique@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profIgor: Professor = {
  id: 9,
  codigo: 1008,
  nome: 'Igor Sociologia',
  email: 'igor@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profJulia: Professor = {
  id: 10,
  codigo: 1009,
  nome: 'Julia Filosofia',
  email: 'julia@uni.com',
  senha: 'itachi',
  perfilProfessor: TipoProfessor.PROFESSOR,
  disciplinas: [],
};

export const MOCK_PROFESSORES: Professor[] = [
  profAna,
  profBruno,
  profCarla,
  profDavid,
  profEster,
  profFelipe,
  profGiovanna,
  profHenrique,
  profIgor,
  profJulia,
];

// Disciplinas (7 no total)
const discMatematica: Disciplina = {
  id: 1,
  nome: 'Matemática',
  cor: '#4CAF50',
  professores: [profBruno, profAna],
  perguntas: [],
};
const discHistoria: Disciplina = {
  id: 2,
  nome: 'História',
  cor: '#F44336',
  professores: [profCarla],
  perguntas: [],
};
const discGeografia: Disciplina = {
  id: 3,
  nome: 'Geografia',
  cor: '#2196F3',
  professores: [profDavid, profCarla],
  perguntas: [],
};
const discIngles: Disciplina = {
  id: 4,
  nome: 'Inglês',
  cor: '#FFC107',
  professores: [profEster],
  perguntas: [],
};
const discQuimica: Disciplina = {
  id: 5,
  nome: 'Química',
  cor: '#9C27B0',
  professores: [profFelipe],
  perguntas: [],
};
const discFisica: Disciplina = {
  id: 6,
  nome: 'Física',
  cor: '#00BCD4',
  professores: [profGiovanna],
  perguntas: [],
};
const discBiologia: Disciplina = {
  id: 7,
  nome: 'Biologia',
  cor: '#8BC34A',
  professores: [profHenrique],
  perguntas: [],
};

export const MOCK_DISCIPLINAS: Disciplina[] = [
  discMatematica,
  discHistoria,
  discGeografia,
  discIngles,
  discQuimica,
  discFisica,
  discBiologia,
];

// Relacionamentos Professor <-> Disciplina
profAna.disciplinas = [discMatematica];
profBruno.disciplinas = [discMatematica];
profCarla.disciplinas = [discHistoria, discGeografia];
profDavid.disciplinas = [discGeografia];
profEster.disciplinas = [discIngles];
profFelipe.disciplinas = [discQuimica];
profGiovanna.disciplinas = [discFisica];
profHenrique.disciplinas = [discBiologia];
profIgor.disciplinas = [];
profJulia.disciplinas = [];

// --- PERGUNTAS E ALTERNATIVAS ---

let perguntaId = 1;
let alternativaId = 1;
const MOCK_PERGUNTAS: Pergunta[] = [];

// Função auxiliar para criar perguntas
const criarPergunta = (
  enunciado: string,
  codigoProfessor: number,
  disciplinaId: number,
  numAlternativas: number
): Pergunta => {
  const idPergunta = perguntaId++;

  const alternativas: Alternativa[] = [];
  for (let i = 0; i < numAlternativas; i++) {
    alternativas.push({
      id: alternativaId++,
      texto: `Alternativa ${i + 1} - ${enunciado.substring(0, 20)}`,
      perguntaId: idPergunta, // ✅ referência direta à pergunta
    });
  }

  return {
    id: idPergunta,
    enunciado,
    codigoProfessor,
    disciplinaId,
    alternativas,
  };
};

// --- PERGUNTAS POR DISCIPLINA ---

// Matemática (Bruno)
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual o valor de Pi com duas casas decimais?',
    profBruno.codigo,
    discMatematica.id,
    4
  ),
  criarPergunta(
    'Qual a fórmula de Bhaskara?',
    profBruno.codigo,
    discMatematica.id,
    5
  ),
  criarPergunta(
    'O que é um número primo?',
    profBruno.codigo,
    discMatematica.id,
    4
  )
);

// História (Carla)
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual o marco inicial da Idade Média?',
    profCarla.codigo,
    discHistoria.id,
    5
  ),
  criarPergunta('Quem foi D. Pedro I?', profCarla.codigo, discHistoria.id, 4),
  criarPergunta(
    'O que foi a Guerra Fria?',
    profCarla.codigo,
    discHistoria.id,
    5
  ),
  criarPergunta(
    'Quem descobriu o Brasil?',
    profCarla.codigo,
    discHistoria.id,
    4
  ),
  criarPergunta(
    'O que foi a Revolução Francesa?',
    profCarla.codigo,
    discHistoria.id,
    5
  )
);

// Geografia (David e Carla)
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual o maior deserto do mundo?',
    profDavid.codigo,
    discGeografia.id,
    4
  ),
  criarPergunta(
    'O que são placas tectônicas?',
    profDavid.codigo,
    discGeografia.id,
    5
  ),
  criarPergunta(
    'Qual a capital do Canadá?',
    profDavid.codigo,
    discGeografia.id,
    4
  ),
  criarPergunta('O que é latitude?', profCarla.codigo, discGeografia.id, 4),
  criarPergunta(
    'Explique o que são fusos horários.',
    profCarla.codigo,
    discGeografia.id,
    5
  ),
  criarPergunta(
    'Qual o país mais populoso do mundo?',
    profCarla.codigo,
    discGeografia.id,
    4
  ),
  criarPergunta('O que é um continente?', profCarla.codigo, discGeografia.id, 5)
);

// Inglês (Ester)
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Tradução de "Hello World".',
    profEster.codigo,
    discIngles.id,
    4
  ),
  criarPergunta('Qual o plural de "mouse"?', profEster.codigo, discIngles.id, 5)
);

// Química (Felipe)
MOCK_PERGUNTAS.push(
  criarPergunta('O que é pH?', profFelipe.codigo, discQuimica.id, 4),
  criarPergunta(
    'Qual o número atômico do Oxigênio?',
    profFelipe.codigo,
    discQuimica.id,
    5
  )
);

// Física (Giovanna)
MOCK_PERGUNTAS.push(
  criarPergunta(
    'O que é a Lei da Inércia?',
    profGiovanna.codigo,
    discFisica.id,
    4
  )
);

// Biologia (Henrique)
MOCK_PERGUNTAS.push(
  criarPergunta(
    'O que é fotossíntese?',
    profHenrique.codigo,
    discBiologia.id,
    5
  )
);

// --- Associação das perguntas às disciplinas ---
discMatematica.perguntas = MOCK_PERGUNTAS.filter(
  (p) => p.disciplinaId === discMatematica.id
);
discHistoria.perguntas = MOCK_PERGUNTAS.filter(
  (p) => p.disciplinaId === discHistoria.id
);
discGeografia.perguntas = MOCK_PERGUNTAS.filter(
  (p) => p.disciplinaId === discGeografia.id
);
discIngles.perguntas = MOCK_PERGUNTAS.filter(
  (p) => p.disciplinaId === discIngles.id
);
discQuimica.perguntas = MOCK_PERGUNTAS.filter(
  (p) => p.disciplinaId === discQuimica.id
);
discFisica.perguntas = MOCK_PERGUNTAS.filter(
  (p) => p.disciplinaId === discFisica.id
);
discBiologia.perguntas = MOCK_PERGUNTAS.filter(
  (p) => p.disciplinaId === discBiologia.id
);

// --- SERVIÇO MOCK ---

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  getProfessores(): Professor[] {
    return MOCK_PROFESSORES;
  }

  getDisciplinas(): Disciplina[] {
    return MOCK_DISCIPLINAS;
  }

  getPerguntas(): Pergunta[] {
    return MOCK_PERGUNTAS;
  }

  /**
   * Valida a regra de negócio:
   * "a pergunta só pode ser adicionada por um professor da disciplina".
   */


  /*
  validarAdicaoPergunta(
    codigoProfessor: number,
    disciplinaId: number
  ): boolean {
    const professor = MOCK_PROFESSORES.find(
      (p) => p.codigo === codigoProfessor
    );
    const disciplina = MOCK_DISCIPLINAS.find((d) => d.id === disciplinaId);

    if (!professor || !disciplina) return false;

    return disciplina.professores.some((p) => p.codigo === codigoProfessor);
  }
}
  */
