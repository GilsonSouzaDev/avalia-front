// src/app/services/disciplina.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Disciplina } from '../interfaces/Disciplina';
import { MockDataService } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class DisciplinaService {
  
  private mock = inject(MockDataService);

  private disciplinasSignal = signal<Disciplina[]>(this.mock.getDisciplinas());
  disciplinas = computed(() => this.disciplinasSignal());

  constructor() {}

  // GET
  getById(id: number): Disciplina | null {
    return this.disciplinasSignal().find((d) => d.id === id) ?? null;
  }

  // CREATE
  add(disciplina: Disciplina) {
    this.disciplinasSignal.update((list) => [...list, { ...disciplina }]);
  }

  // UPDATE
  update(id: number, changes: Partial<Disciplina>) {
    this.disciplinasSignal.update((list) =>
      list.map((d) => (d.id === id ? { ...d, ...changes } : d))
    );
  }

  // DELETE
  delete(id: number) {
    this.disciplinasSignal.update((list) => list.filter((d) => d.id !== id));
  }
}
