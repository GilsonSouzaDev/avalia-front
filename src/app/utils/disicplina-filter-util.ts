import { Disciplina } from '../interfaces/Disciplina';
import { Professor } from '../interfaces/Professor';
import { Pergunta } from '../interfaces/Pergunta';

/**
 * Filtra as perguntas de uma disciplina para manter apenas aquelas
 * pertencentes ao professor cujo código foi informado.
 * Retorna uma nova lista de perguntas, sem alterar o array original.
 *
 * @param perguntas Lista de perguntas da disciplina
 * @param codigoProfessor Código do professor logado
 * @returns Lista de perguntas do professor
 */
function filtrarPerguntasPorCodigo(
  perguntas: Pergunta[] = [],
  codigoProfessor: number
): Pergunta[] {
  if (!Array.isArray(perguntas) || perguntas.length === 0) return [];
  return perguntas.filter((p) => p.codigoProfessor === codigoProfessor);
}

/**
 * Filtra as disciplinas exibidas para um determinado professor.
 * - Inclui disciplinas em que o professor leciona.
 * - Inclui disciplinas em que há perguntas cadastradas pelo professor.
 * - Dentro de cada disciplina, mantém apenas as perguntas do professor.
 *
 * @param disciplinas Lista completa de disciplinas
 * @param usuario Professor logado (ou null/undefined)
 * @returns Lista de disciplinas filtradas
 */
export function filtrarDisciplinasPorPerfil(
  disciplinas: Disciplina[] = [],
  usuario?: Professor | null
): Disciplina[] {
  if (!usuario) return [];
  if (!Array.isArray(disciplinas) || disciplinas.length === 0) return [];

  const usuarioId = usuario.id;
  const usuarioCodigo = usuario.codigo;

  // Aplica o filtro disciplina a disciplina
  const resultado = disciplinas
    .map((disciplina) => {
      const professores = Array.isArray(disciplina.professores)
        ? disciplina.professores
        : [];
      const perguntas = Array.isArray(disciplina.perguntas)
        ? disciplina.perguntas
        : [];

      // Verifica se o professor leciona essa disciplina
      const leciona = professores.some((prof) => prof?.id === usuarioId);

      // Filtra perguntas que pertencem ao professor logado
      const perguntasDoUsuario = filtrarPerguntasPorCodigo(
        perguntas,
        usuarioCodigo
      );

      // Cria uma nova cópia da disciplina, mantendo só as perguntas relevantes
      const disciplinaFiltrada: Disciplina = {
        ...disciplina,
        perguntas: perguntasDoUsuario,
      };

      return {
        disciplinaFiltrada,
        deveIncluir: leciona || perguntasDoUsuario.length > 0,
      };
    })
    .filter((item) => item.deveIncluir) // Mantém apenas disciplinas relevantes
    .map((item) => item.disciplinaFiltrada); // Retorna apenas a disciplina

  return resultado;
}

/**
 * Conta o número de perguntas que o professor logado cadastrou
 * em uma disciplina específica.
 *
 * @param disciplina Disciplina analisada
 * @param usuario Professor logado
 * @returns Quantidade de perguntas cadastradas pelo professor
 */
export function contarPerguntasPorDisciplinaEProfessorEspecifico(
  disciplina: Disciplina,
  usuario?: Professor | null
): number {
  if (!usuario || !disciplina || !disciplina.perguntas) return 0;

  const codigoProfessor = usuario.codigo;
  const contagem = disciplina.perguntas.filter(
    (pergunta) => pergunta.codigoProfessor === codigoProfessor
  ).length;

  console.log(
    `[Contagem] Professor "${usuario.nome}" (Código: ${codigoProfessor}) | Disciplina "${disciplina.nome}" | Total: ${contagem}`
  );

  return contagem;
}
