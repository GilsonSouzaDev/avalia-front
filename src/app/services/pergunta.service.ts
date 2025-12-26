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
    const formData = new FormData();
    const { imagem, ...dto } = pergunta;

    formData.append('pergunta', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (imagem) {
      formData.append('imagem', imagem as any);
    }

    return this.http.post<Pergunta>(this.url, formData).pipe(
      tap((created) => {
        this.perguntasSignal.update((list) => [...list, created]);
      })
    );
  }

  public update(id: number, changes: Partial<Pergunta> | any): Observable<Pergunta> {
    const formData = new FormData();
    const { imagem, ...dto } = changes;

    formData.append('pergunta', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    if (imagem && typeof imagem !== 'string') {
      formData.append('imagem', imagem);
    }

    return this.http.put<Pergunta>(`${this.url}/${id}`, formData).pipe(
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