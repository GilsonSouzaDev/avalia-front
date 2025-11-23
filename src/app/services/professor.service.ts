import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Professor } from '../interfaces/Professor';
import { tap, Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { EsqueciSenha } from '../interfaces/EsqueciSenha';


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

  public redefinirSenha(dados: EsqueciSenha): Observable<void> {
    return this.http.put<void>(`${this.url}/recuperar-senha`, dados);
  }

  public getAll(): Observable<Professor[]> {
    return this.http.get<Professor[]>(this.url);
  }

  public loadAll(): void {
    this.http.get<Professor[]>(this.url).subscribe({
      next: (data) => this.professoresSignal.set(data),
      error: (err) => console.error(err),
    });
  }

  public getById(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.url}/${id}`);
  }

  public add(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.url, professor).pipe(
      tap((created) => {
        this.professoresSignal.update((list) => [...list, created]);
      })
    );
  }

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

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      tap(() => {
        this.professoresSignal.update((list) =>
          list.filter((p) => p.id !== id)
        );
      })
    );
  }

  /**
   * Verifica se existe algum professor com este nome.
   * @param nome O nome a ser verificado.
   * @param idIgnorado (Opcional) ID do professor que está sendo editado para não validar contra ele mesmo.
   */
  public verificarNomeExistente(nome: string, idIgnorado?: number): boolean {
    const lista = this.professoresSignal();
    return lista.some(
      (p) =>
        p.nome.trim().toLowerCase() === nome.trim().toLowerCase() &&
        p.id !== idIgnorado
    );
  }

  /**
   * Verifica se existe algum professor com este email.
   */
  public verificarEmailExistente(email: string, idIgnorado?: number): boolean {
    const lista = this.professoresSignal();
    return lista.some(
      (p) =>
        p.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        p.id !== idIgnorado
    );
  }
}
