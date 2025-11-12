// filtros.ts

import { Disciplina } from "../interfaces/Disciplina";
import { Professor } from "../interfaces/Professor";



/**
 * Retorna o número de perguntas que um professor específico cadastrou
 * em uma disciplina específica.
 *
 * @param disciplina O objeto da Disciplina que se deseja contar.
 * @param usuario O Professor logado.
 * @returns Um valor numérico (number) representando o total de perguntas
 * do usuário nesta disciplina. Retorna 0 se o usuário ou a disciplina não forem fornecidos.
 */
export function contarPerguntasPorDisciplinaEProfessorEspecifico(
  disciplina: Disciplina,
  usuario?: Professor | null
): number {
  if (!usuario || !disciplina || !disciplina.perguntas) return 0;
  const codigoProfessor = usuario.codigo;
  const contagem = disciplina.perguntas.filter((pergunta) => {
    return pergunta.codigoProfessor === codigoProfessor;
  }).length;
  console.log(
    `Contagem de perguntas para professor "${usuario.nome}" (Código: ${codigoProfessor}) na disciplina "${disciplina.nome}": ${contagem}`
  );

  return contagem;
}

/**
 * Filtra disciplinas com base no professor informado.
 * - Retorna disciplinas em que o professor leciona (id).
 * - Ou disciplinas que contenham perguntas cujo codigoProfessor corresponde ao codigo do usuário.
 *
 * Observação: NÃO faz exceção para coordenador — sempre aplica o filtro.
 *
 * @param disciplinas Lista de disciplinas (mock ou vindo do backend). Default: [].
 * @param usuario Professor logado (ou null/undefined) — se ausente, retorna [].
 */
export function filtrarDisciplinasPorPerfil(
  disciplinas: Disciplina[] = [],
  usuario?: Professor | null
): Disciplina[] {
  if (!usuario) return [];
  if (!Array.isArray(disciplinas) || disciplinas.length === 0) return [];

  const usuarioId = usuario.id;
  const usuarioCodigo = usuario.codigo; // Usar o código para comparação com perguntas

  return disciplinas.filter((disciplina) => {
    const professores = Array.isArray(disciplina.professores)
      ? disciplina.professores
      : [];
    const perguntas = Array.isArray(disciplina.perguntas)
      ? disciplina.perguntas
      : [];
    const leciona = professores.some((prof) => prof?.id === usuarioId);


    const possuiPerguntaDoUsuario = perguntas.some((pergunta) => {
      return pergunta.codigoProfessor === usuarioCodigo;
    });

    console.log(
      `Filtro: Disciplina "${disciplina.nome}" - Leciona: ${leciona}, Possui Pergunta: ${possuiPerguntaDoUsuario}`
    );

    return leciona || possuiPerguntaDoUsuario;
  });
}
