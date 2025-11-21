// src/app/services/professor.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Professor } from '../interfaces/Professor';
import { tap, Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/professores`;

  private professoresSignal = signal<Professor[]>([]);
  public professores = computed(() => this.professoresSignal());

  constructor() {
    this.loadAll();
  }

  // Adicione isso na classe ProfessorService
  public getAll(): Observable<Professor[]> {
    return this.http.get<Professor[]>(this.url);
  }

  public loadAll(): void {
    this.http.get<Professor[]>(this.url).subscribe({
      next: (data) => this.professoresSignal.set(data),
      error: (err) => console.error('Erro ao carregar professores', err),
    });
  }

  // GET BY ID
  public getById(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.url}/${id}`);
  }

  // Busca local para evitar round-trip se já tivermos os dados (Opcional)
  public getByIdLocal(id: number): Professor | undefined {
    return this.professoresSignal().find((p) => p.id === id);
  }

  // CREATE
  public add(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.url, professor).pipe(
      tap((created) => {
        this.professoresSignal.update((list) => [...list, created]);
      })
    );
  }

  // UPDATE
  public update(
    id: number,
    changes: Partial<Professor>
  ): Observable<Professor> {
    return this.http.put<Professor>(`${this.url}/${id}`, changes).pipe(
      tap((updated) => {
        this.professoresSignal.update((list) =>
          list.map((p) => (p.id === id ? { ...p, ...updated } : p))
        );
      })
    );
  }

  // DELETE
  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        this.professoresSignal.update((list) =>
          list.filter((p) => p.id !== id)
        );
      })
    );
  }
}
