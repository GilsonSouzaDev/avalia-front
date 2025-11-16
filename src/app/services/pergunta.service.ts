// src/app/services/pergunta.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Pergunta } from '../interfaces/Pergunta';
import { MockDataService } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class PerguntaService {
  private mock = inject(MockDataService);

  private perguntasSignal = signal<Pergunta[]>(this.mock.getPerguntas());
  perguntas = computed(() => this.perguntasSignal());

  constructor() {}

  // GET
  getById(id: number): Pergunta | null {
    return this.perguntasSignal().find((p) => p.id === id) ?? null;
  }

  getByDisciplina(disciplinaId: number): Pergunta[] {
    return this.perguntasSignal().filter(
      (p) => p.disciplinaId === disciplinaId
    );
  }

  // CREATE
  add(pergunta: Pergunta): boolean {
    const permitido = this.mock.validarAdicaoPergunta(
      pergunta.codigoProfessor,
      pergunta.disciplinaId
    );

    if (!permitido) {
      console.warn('Professor não pertence à disciplina!');
      return false;
    }

    this.perguntasSignal.update((list) => [...list, { ...pergunta }]);
    return true;
  }

  // UPDATE
  update(id: number, changes: Partial<Pergunta>) {
    this.perguntasSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  }

  // DELETE
  delete(id: number) {
    this.perguntasSignal.update((list) => list.filter((p) => p.id !== id));
  }
}
