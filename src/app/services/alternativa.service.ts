import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alternativa } from '../interfaces/Alternativa';
import { tap, Observable } from 'rxjs';
import { environment } from '../../environments/environments';


@Injectable({
  providedIn: 'root',
})
export class AlternativaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/alternativas`;

  private alternativasSignal = signal<Alternativa[]>([]);
  public alternativas = computed(() => this.alternativasSignal());

  public getAlternativasByPergunta(
    perguntaId: number
  ): Observable<Alternativa[]> {
    return this.http.get<Alternativa[]>(`${this.url}/pergunta/${perguntaId}`);
  }

  public addAlternativa(
    alternativa: Partial<Alternativa>
  ): Observable<Alternativa> {
    return this.http.post<Alternativa>(this.url, alternativa).pipe(
      tap((created) => {
        this.alternativasSignal.update((list) => [...list, created]);
      })
    );
  }

  public updateAlternativa(alternativa: Alternativa): Observable<Alternativa> {
    return this.http
      .put<Alternativa>(`${this.url}/${alternativa.id}`, alternativa)
      .pipe(
        tap((updated) => {
          this.alternativasSignal.update((list) =>
            list.map((a) => (a.id === updated.id ? updated : a))
          );
        })
      );
  }

  public deleteAlternativa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        this.alternativasSignal.update((list) =>
          list.filter((a) => a.id !== id)
        );
      })
    );
  }
}
