// src/app/core/services/base.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Professor } from '../interfaces/Professor';
import { Disciplina } from '../interfaces/Disciplina';
import { Pergunta } from '../interfaces/Pergunta';
import { MockDataService } from './mock-data';


@Injectable({
  providedIn: 'root',
})
export class BaseService {

  private mock = new MockDataService();

  // SIGNALS -----------------------------------------------------
  private professoresSignal = signal<Professor[]>(this.mock.getProfessores());
  private disciplinasSignal = signal<Disciplina[]>(this.mock.getDisciplinas());
  private perguntasSignal = signal<Pergunta[]>(this.mock.getPerguntas());

  // GETTERS -----------------------------------------------------
  professores = computed(() => this.professoresSignal());
  disciplinas = computed(() => this.disciplinasSignal());
  perguntas = computed(() => this.perguntasSignal());

  // =============================================================
  // ------------------------ PROFESSORES ------------------------
  // =============================================================

  getProfessorById(id: number): Professor | null {
    return this.professoresSignal().find((p) => p.id === id) ?? null;
  }

  getProfessorByCodigo(codigo: number): Professor | null {
    return this.professoresSignal().find((p) => p.codigo === codigo) ?? null;
  }

  addProfessor(novo: Professor) {
    this.professoresSignal.update((list) => [...list, { ...novo }]);
  }

  updateProfessor(id: number, changes: Partial<Professor>) {
    this.professoresSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  }

  deleteProfessor(id: number) {
    this.professoresSignal.update((list) => list.filter((p) => p.id !== id));
  }

  // =============================================================
  // ------------------------ DISCIPLINAS -------------------------
  // =============================================================

  getDisciplinaById(id: number): Disciplina | null {
    return this.disciplinasSignal().find((d) => d.id === id) ?? null;
  }

  addDisciplina(nova: Disciplina) {
    this.disciplinasSignal.update((list) => [...list, { ...nova }]);
  }

  // =============================================================
  // ------------------------- PERGUNTAS --------------------------
  // =============================================================

  getPerguntasByDisciplina(idDisciplina: number): Pergunta[] {
    return this.perguntasSignal().filter(
      (p) => p.disciplinaId === idDisciplina
    );
  }

  addPergunta(pergunta: Pergunta): boolean {
    // regra de negócio do mock
    const valido = this.mock.validarAdicaoPergunta(
      pergunta.codigoProfessor,
      pergunta.disciplinaId
    );

    if (!valido) {
      console.warn(
        'Professor não tem autorização para criar pergunta nesta disciplina.'
      );
      return false;
    }

    this.perguntasSignal.update((list) => [...list, { ...pergunta }]);
    return true;
  }

  updatePergunta(id: number, changes: Partial<Pergunta>) {
    this.perguntasSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  }

  deletePergunta(id: number) {
    this.perguntasSignal.update((list) => list.filter((p) => p.id !== id));
  }

  // =============================================================
  // ------------------------ RELACIONAMENTOS ---------------------
  // =============================================================

  getDisciplinasDoProfessor(codigoProfessor: number): Disciplina[] {
    return this.disciplinasSignal().filter((d) =>
      d.professores.some((p) => p.codigo === codigoProfessor)
    );
  }

  getProfessoresDaDisciplina(idDisciplina: number): Professor[] {
    return this.professoresSignal().filter((p) =>
      p.disciplinas.some((d) => d.id === idDisciplina)
    );
  }
}
