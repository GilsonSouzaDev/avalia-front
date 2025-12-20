import { Disciplina } from '../interfaces/Disciplina';
import { Professor } from '../interfaces/Professor';
import { Pergunta } from '../interfaces/Pergunta';

/**
 * Filtra as perguntas de uma lista para manter apenas aquelas
 * pertencentes ao professor cujo código foi informado.
 *
 * @param perguntas Lista de perguntas (geralmente buscada do serviço de perguntas)
 * @param codigoProfessor Código do professor logado
 * @returns Lista de perguntas do professor
 */
export function filtrarPerguntasPorCodigo(
  perguntas: Pergunta[] = [],
  professor: Professor | null | undefined
): Pergunta[] {
  if (!Array.isArray(perguntas) || perguntas.length === 0) return [];
  return perguntas.filter((p) => p.professorId === professor?.id);
}

/**
 * Filtra as disciplinas exibidas para um determinado professor.
 * Como o backend já retorna as disciplinas vinculadas dentro do objeto Professor,
 * essa função verifica quais disciplinas da lista completa o professor tem vínculo.
 *
 * @param disciplinas Lista completa de disciplinas (opcional)
 * @param usuario Professor logado
 * @returns Lista de disciplinas que o professor leciona
 */
export function filtrarDisciplinasPorPerfil(
  disciplinas: Disciplina[] = [],
  usuario?: Professor | null
): Disciplina[] {
  if (!usuario || !usuario.disciplinas) return [];

  // Cria um Set com os IDs das disciplinas que o professor leciona para busca rápida
  const idsLecionados = new Set(usuario.disciplinas.map((d) => d.id));

  // Se a lista 'disciplinas' foi passada, filtramos ela.
  // Se não, retornamos direto o que veio no objeto do usuário.
  if (disciplinas.length > 0) {
    return disciplinas.filter((d) => idsLecionados.has(d.id));
  }

  return usuario.disciplinas;
}

/**
 * Conta o número de perguntas que o professor logado cadastrou
 * em uma disciplina específica.
 *
 * ATENÇÃO: Como a Disciplina não contém mais a lista de objetos Pergunta,
 * precisamos receber a lista de perguntas carregadas externamente.
 *
 * @param disciplinaId ID da Disciplina analisada
 * @param usuario Professor logado
 * @param todasPerguntas Lista de todas as perguntas carregadas (opcional)
 * @returns Quantidade de perguntas
 */
export function contarPerguntasPorDisciplinaEProfessorEspecifico(
  disciplinaId: number,
  usuario?: Professor | null,
  todasPerguntas: Pergunta[] = []
): number {
  if (!usuario || !todasPerguntas.length) return 0;

  const codigoProfessor = usuario.id;

  const contagem = todasPerguntas.filter(
    (pergunta) =>
      pergunta.professorId === codigoProfessor &&
      // Verifica se a pergunta pertence à disciplina (checamos objeto ou ID)
      pergunta.disciplina?.id === disciplinaId
  ).length;

  return contagem;
}
