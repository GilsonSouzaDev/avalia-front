// mock-data.ts

import { Alternativa } from "../interfaces/Alternativa";
import { Disciplina } from "../interfaces/Disciplina";
import { Pergunta } from "../interfaces/Pergunta";
import { Professor, TipoProfessor } from "../interfaces/Professor";


// --- MOCK DATA ---

// 1. Declaração inicial dos objetos para lidar com a circularidade

// Professores (10 no total, incluindo 1 Coordenador)
const profAna: Professor = {
  id: 1,
  codigo: 1000,
  nome: 'Ana Coordenadora',
  email: 'ana@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.COORDENADOR,
  disciplinas: [],
};
const profBruno: Professor = {
  id: 2,
  codigo: 1001,
  nome: 'Bruno Matemática',
  email: 'bruno@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profCarla: Professor = {
  id: 3,
  codigo: 1002,
  nome: 'Carla História',
  email: 'carla@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profDavid: Professor = {
  id: 4,
  codigo: 1003,
  nome: 'David Geografia',
  email: 'david@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profEster: Professor = {
  id: 5,
  codigo: 1004,
  nome: 'Ester Inglês',
  email: 'ester@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profFelipe: Professor = {
  id: 6,
  codigo: 1005,
  nome: 'Felipe Química',
  email: 'felipe@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profGiovanna: Professor = {
  id: 7,
  codigo: 1006,
  nome: 'Giovanna Física',
  email: 'gio@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profHenrique: Professor = {
  id: 8,
  codigo: 1007,
  nome: 'Henrique Biologia',
  email: 'henrique@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profIgor: Professor = {
  id: 9,
  codigo: 1008,
  nome: 'Igor Sociologia',
  email: 'igor@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
  disciplinas: [],
};
const profJulia: Professor = {
  id: 10,
  codigo: 1009,
  nome: 'Julia Filosofia',
  email: 'julia@uni.com',
  senha: 'itachi',
  tipo: TipoProfessor.PROFESSOR,
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
  professores: [profDavid, profAna],
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

// 2. Ajuste das referências circulares (Professor -> Disciplina)
profAna.disciplinas.push(discMatematica, discGeografia);
profBruno.disciplinas.push(discMatematica);
profCarla.disciplinas.push(discHistoria);
profDavid.disciplinas.push(discGeografia);
profEster.disciplinas.push(discIngles);
profFelipe.disciplinas.push(discQuimica);
profGiovanna.disciplinas.push(discFisica);
profHenrique.disciplinas.push(discBiologia);
profIgor.disciplinas.push(); // Professor sem disciplina
profJulia.disciplinas.push(); // Professor sem disciplina

// 3. Perguntas e Alternativas (15 no total, 4 a 5 por pergunta)
let perguntaId = 1;
let alternativaId = 1;
const MOCK_PERGUNTAS: Pergunta[] = [];

// Função auxiliar para criar perguntas
const criarPergunta = (
  enunciado: string,
  codigoProfessor: number,
  disciplinaId: number,
  numAlternativas: 4 | 5
): Pergunta => {
  const alternativas: Alternativa[] = [];
  for (let i = 0; i < numAlternativas; i++) {
    alternativas.push({
      id: alternativaId++,
      texto: `Alternativa ${String.fromCharCode(
        65 + i
      )} - ${enunciado.substring(0, 10)}`,
    });
  }
  const pergunta: Pergunta = {
    id: perguntaId++,
    enunciado: enunciado,
    codigoProfessor: codigoProfessor,
    alternativas: alternativas,
    disciplinaId: disciplinaId,
  };
  return pergunta;
};

// 1. Matemática (Prof. Bruno) - 3 perguntas
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual o valor de Pi com duas casas decimais?',
    profBruno.codigo,
    discMatematica.id,
    4
  )
);
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual a fórmula de Bhaskara?',
    profBruno.codigo,
    discMatematica.id,
    5
  )
);
MOCK_PERGUNTAS.push(
  criarPergunta(
    'O que é um número primo?',
    profBruno.codigo,
    discMatematica.id,
    4
  )
);

// 2. História (Prof. Carla) - 3 perguntas
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual o marco inicial da Idade Média?',
    profCarla.codigo,
    discHistoria.id,
    5
  )
);
MOCK_PERGUNTAS.push(
  criarPergunta('Quem foi D. Pedro I?', profCarla.codigo, discHistoria.id, 4)
);
MOCK_PERGUNTAS.push(
  criarPergunta(
    'O que foi a Guerra Fria?',
    profCarla.codigo,
    discHistoria.id,
    5
  )
);

// 3. Geografia (Prof. David) - 3 perguntas
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual o maior deserto do mundo?',
    profDavid.codigo,
    discGeografia.id,
    4
  )
);
MOCK_PERGUNTAS.push(
  criarPergunta(
    'O que são placas tectônicas?',
    profDavid.codigo,
    discGeografia.id,
    5
  )
);
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual a capital do Canadá?',
    profDavid.codigo,
    discGeografia.id,
    4
  )
);

// 4. Inglês (Prof. Ester) - 2 perguntas
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Tradução de "Hello World".',
    profEster.codigo,
    discIngles.id,
    4
  )
);
MOCK_PERGUNTAS.push(
  criarPergunta('Qual o plural de "mouse"?', profEster.codigo, discIngles.id, 5)
);

// 5. Química (Prof. Felipe) - 2 perguntas
MOCK_PERGUNTAS.push(
  criarPergunta('O que é pH?', profFelipe.codigo, discQuimica.id, 4)
);
MOCK_PERGUNTAS.push(
  criarPergunta(
    'Qual o número atômico do Oxigênio?',
    profFelipe.codigo,
    discQuimica.id,
    5
  )
);

// 6. Física (Prof. Giovanna) - 1 pergunta
MOCK_PERGUNTAS.push(
  criarPergunta(
    'O que é a Lei da Inércia?',
    profGiovanna.codigo,
    discFisica.id,
    4
  )
);

// 7. Biologia (Prof. Henrique) - 1 pergunta
MOCK_PERGUNTAS.push(
  criarPergunta(
    'O que é fotossíntese?',
    profHenrique.codigo,
    discBiologia.id,
    5
  )
);

// 4. Atualização das Disciplinas com as Perguntas
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

// 5. Classe de Serviço Mock para simular a lógica de acesso e a regra de negócio

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
   * Valida a regra de negócio: "a pergunta só pode ser adicionada por um professor da disciplina".
   * @param codigoProfessor O código do professor que está tentando adicionar a pergunta.
   * @param disciplinaId O ID da disciplina onde a pergunta será adicionada.
   * @returns true se o professor leciona a disciplina, false caso contrário.
   */
  validarAdicaoPergunta(
    codigoProfessor: number,
    disciplinaId: number
  ): boolean {
    const professor = MOCK_PROFESSORES.find(
      (p) => p.codigo === codigoProfessor
    );
    const disciplina = MOCK_DISCIPLINAS.find((d) => d.id === disciplinaId);

    if (!professor || !disciplina) {
      return false;
    }

    // Verifica se o professor está na lista de professores da disciplina
     return disciplina.professores.some((p) => p.codigo === codigoProfessor);
  }
}
