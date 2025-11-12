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
