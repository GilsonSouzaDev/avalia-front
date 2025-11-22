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

  public loadAll(): void {
    this.http.get<Disciplina[]>(this.url).subscribe({
      next: (data) => this.disciplinasSignal.set(data),
      error: (err) => console.error(err),
    });
  }

  public getById(id: number): Observable<Disciplina> {
    return this.http.get<Disciplina>(`${this.url}/${id}`);
  }

  public add(disciplina: Disciplina): Observable<Disciplina> {
    return this.http.post<Disciplina>(this.url, disciplina).pipe(
      tap((created) => {
        this.disciplinasSignal.update((list) => [...list, created]);
      })
    );
  }

  public update(
    id: number,
    changes: Partial<Disciplina>
  ): Observable<Disciplina> {
    return this.http.put<Disciplina>(`${this.url}/${id}`, changes).pipe(
      tap((updated) => {
        this.disciplinasSignal.update((list) =>
          list.map((d) => (d.id === id ? { ...d, ...updated } : d))
        );
      })
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        this.disciplinasSignal.update((list) =>
          list.filter((d) => d.id !== id)
        );
      })
    );
  }

  public buscarPorNome(nome: string): Observable<Disciplina[]> {
    return this.http.get<Disciplina[]>(`${this.url}/buscar`, {
      params: { nome },
    });
  }
}
