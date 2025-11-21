// src/app/services/pergunta.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pergunta } from '../interfaces/Pergunta';
import { tap, Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PerguntaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/perguntas`;

  private perguntasSignal = signal<Pergunta[]>([]);
  public perguntas = computed(() => this.perguntasSignal());

  constructor() {
    this.loadAll();
  }

  public loadAll(): void {
    this.http.get<Pergunta[]>(this.url).subscribe({
      next: (data) => this.perguntasSignal.set(data),
      error: (err) => console.error('Erro ao carregar perguntas', err),
    });
  }

  // Filtragem feita no client-side (baseada no signal carregado)
  // Idealmente, crie um endpoint no Java: /api/perguntas?disciplinaId=X
  public getByDisciplina(disciplinaId: number): Pergunta[] {
    return this.perguntasSignal().filter(
      (p) => p.disciplinaId === disciplinaId
    );
  }

  public getById(id: number): Observable<Pergunta> {
    return this.http.get<Pergunta>(`${this.url}/${id}`);
  }

  // CREATE
  public add(pergunta: Pergunta): Observable<Pergunta> {
    // A validação de "Professor pertence à disciplina" deve ser feita no Backend agora,
    // mas o seu código antigo fazia no frontend. O backend retornará erro se falhar.
    return this.http.post<Pergunta>(this.url, pergunta).pipe(
      tap((created) => {
        this.perguntasSignal.update((list) => [...list, created]);
      })
    );
  }

  // UPDATE
  public update(id: number, changes: Partial<Pergunta>): Observable<Pergunta> {
    return this.http.put<Pergunta>(`${this.url}/${id}`, changes).pipe(
      tap((updatedPergunta) => {
        this.perguntasSignal.update((list) =>
          list.map((p) => (p.id === id ? { ...p, ...updatedPergunta } : p))
        );
      })
    );
  }

  // DELETE
  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        this.perguntasSignal.update((list) => list.filter((p) => p.id !== id));
      })
    );
  }
}
