// src/app/services/professor.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Professor } from '../interfaces/Professor';
import { MockDataService } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  private mock = inject(MockDataService);

  private professoresSignal = signal<Professor[]>(this.mock.getProfessores());
  professores = computed(() => this.professoresSignal());

  constructor() {}

  // GET
  getById(id: number): Professor | null {
    return this.professoresSignal().find((p) => p.id === id) ?? null;
  }

  getByCodigo(codigo: number): Professor | null {
    return this.professoresSignal().find((p) => p.codigo === codigo) ?? null;
  }

  // CREATE
  add(professor: Professor) {
    this.professoresSignal.update((list) => [...list, { ...professor }]);
  }

  // UPDATE
  update(id: number, changes: Partial<Professor>) {
    this.professoresSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  }

  // DELETE
  delete(id: number) {
    this.professoresSignal.update((list) => list.filter((p) => p.id !== id));
  }
}
