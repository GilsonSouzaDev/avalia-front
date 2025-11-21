// src/app/services/alternativa.service.ts
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

  // Cache local de alternativas
  private alternativasSignal = signal<Alternativa[]>([]);

  // Computado para filtrar facilmente no componente se necessário,
  // mas idealmente o componente chamará getByPerguntaId
  public todasAlternativas = computed(() => this.alternativasSignal());

  constructor() {
    this.loadAll();
  }

  public loadAll(): void {
    this.http.get<Alternativa[]>(this.url).subscribe({
      next: (data) => this.alternativasSignal.set(data),
      error: (err) => console.error('Erro ao carregar alternativas', err),
    });
  }

  /**
   * Retorna alternativas filtradas por pergunta (Client-side filtering)
   * Nota: O ideal seria ter um endpoint no backend /api/alternativas?perguntaId=X
   */
  public getAlternativasByPergunta(perguntaId: number): Alternativa[] {
    return this.alternativasSignal().filter((a) => a.perguntaId === perguntaId);
  }

  // CREATE
  public addAlternativa(alternativa: Alternativa): Observable<Alternativa> {
    return this.http.post<Alternativa>(this.url, alternativa).pipe(
      tap((created) => {
        this.alternativasSignal.update((list) => [...list, created]);
      })
    );
  }

  // DELETE
  public deleteAlternativa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        this.alternativasSignal.update((list) =>
          list.filter((a) => a.id !== id)
        );
      })
    );
  }

  public updateAlternativa(alternativa: Alternativa): Observable<Alternativa> {
    // Nota: Se der erro 404 ou 405, verifique se seu Backend Java tem @PutMapping
    return this.http.put<Alternativa>(`${this.url}/${alternativa.id}`, alternativa).pipe(
      tap((updated) => {
        this.alternativasSignal.update(list =>
          list.map(a => a.id === alternativa.id ? updated : a)
        );
      })
    );
  }


  // O Backend na pág 9 não mostrou PUT explícito, apenas POST (criar/salvar) e DELETE.
  // Se o método criar/salvar do Java tratar update (se ID existir), use o addAlternativa.
  // Caso contrário, precisaria adicionar o endpoint PUT no Java.
}
