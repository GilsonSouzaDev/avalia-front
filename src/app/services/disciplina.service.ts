// src/app/services/disciplina.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Disciplina } from '../interfaces/Disciplina';
import { tap, Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class DisciplinaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/disciplinas`;

  private disciplinasSignal = signal<Disciplina[]>([]);
  public disciplinas = computed(() => this.disciplinasSignal());

  constructor() {
    this.loadAll();
  }

  // GET - Listar todas
  public loadAll(): void {
    this.http.get<Disciplina[]>(this.url).subscribe({
      next: (data) => this.disciplinasSignal.set(data),
      error: (err) => console.error('Erro ao carregar disciplinas', err),

    });

  }

  public getById(id: number): Observable<Disciplina> {
    return this.http.get<Disciplina>(`${this.url}/${id}`);

  }

  // CREATE
  public add(disciplina: Disciplina): Observable<Disciplina> {
    return this.http.post<Disciplina>(this.url, disciplina).pipe(
      tap((createdDiscp) => {
        // Atualiza o signal local adicionando o novo item
        this.disciplinasSignal.update((list) => [...list, createdDiscp]);
      })
    );
  }

  // UPDATE
  public update(
    id: number,
    changes: Partial<Disciplina>
  ): Observable<Disciplina> {
    return this.http.put<Disciplina>(`${this.url}/${id}`, changes).pipe(
      tap((updatedDiscp) => {
        // Atualiza o signal local
        this.disciplinasSignal.update((list) =>
          list.map((d) => (d.id === id ? { ...d, ...updatedDiscp } : d))
        );
      })
    );
  }

  // DELETE
  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        // Remove do signal local
        this.disciplinasSignal.update((list) =>
          list.filter((d) => d.id !== id)
        );
      })
    );
  }

  // Busca por nome (Endpoint específico do Controller)
  public buscarPorNome(nome: string): Observable<Disciplina[]> {
    return this.http.get<Disciplina[]>(`${this.url}/buscar`, {
      params: { nome },
    });
  }
}
