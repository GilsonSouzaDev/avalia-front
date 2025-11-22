import { Injectable, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Professor, TipoProfessor } from '../interfaces/Professor';
import { environment } from '../../environments/environments';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/professores`;

  public currentUserSig = signal<Professor | null | undefined>(undefined);
  private readonly storageKey = 'currentUser';

  constructor() {
    this.loadUserFromStorage();

    effect(() => {
      const user = this.currentUserSig();
      if (user) {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    });
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.storageKey);
    if (userJson) {
      try {
        this.currentUserSig.set(JSON.parse(userJson));
      } catch (e) {
        this.currentUserSig.set(null);
      }
    } else {
      this.currentUserSig.set(null);
    }
  }

  async login(email: string, senha: string): Promise<Professor | null> {
    try {
      const loginData = { email, senha };
      const professorLogado = await firstValueFrom(
        this.http.post<Professor>(`${this.apiUrl}/login`, loginData)
      );

      this.currentUserSig.set(professorLogado);
      return professorLogado;
    } catch (error) {
      this.currentUserSig.set(null);
      return null;
    }
  }

  logout(): void {
    this.currentUserSig.set(null);
    this.router.navigate(['/login']);
  }

  public isCoordenador(): boolean {
    const currentUser = this.currentUserSig();
    return (
      !!currentUser && currentUser.perfilProfessor === TipoProfessor.COORDENADOR
    );
  }

  public isProfessor(): boolean {
    const currentUser = this.currentUserSig();
    return (
      !!currentUser && currentUser.perfilProfessor === TipoProfessor.PROFESSOR
    );
  }
}
