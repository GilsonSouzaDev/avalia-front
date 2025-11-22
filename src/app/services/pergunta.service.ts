import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pergunta, CadastrarPergunta } from '../interfaces/Pergunta';
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
      error: (err) => console.error(err),
    });
  }

  public getByDisciplina(disciplinaId: number): Pergunta[] {
    return this.perguntasSignal().filter(
      (p) => p.disciplina && p.disciplina.id === disciplinaId
    );
  }

  public getByCodigoProfessor(codigo: number): Observable<Pergunta[]> {
    return this.http.get<Pergunta[]>(`${this.url}/professor/${codigo}`);
  }

  public getById(id: number): Observable<Pergunta> {
    return this.http.get<Pergunta>(`${this.url}/${id}`);
  }

  public add(pergunta: CadastrarPergunta): Observable<Pergunta> {
    return this.http.post<Pergunta>(this.url, pergunta).pipe(
      tap((created) => {
        this.perguntasSignal.update((list) => [...list, created]);
      })
    );
  }

  public update(id: number, changes: Partial<Pergunta>): Observable<Pergunta> {
    return this.http.put<Pergunta>(`${this.url}/${id}`, changes).pipe(
      tap((updated) => {
        this.perguntasSignal.update((list) =>
          list.map((p) => (p.id === id ? { ...p, ...updated } : p))
        );
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        this.perguntasSignal.update((list) => list.filter((p) => p.id !== id));
      })
    );
  }
}
