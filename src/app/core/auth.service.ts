// src/app/services/auth.service.ts
import { Injectable, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Professor, TipoProfessor } from '../interfaces/Professor';
import { firstValueFrom } from 'rxjs';
import { ProfessorService } from '../services/professor.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private professorService = inject(ProfessorService);

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
      this.currentUserSig.set(JSON.parse(userJson));
    } else {
      this.currentUserSig.set(null);
    }
  }

  /**
   * Simula o login baixando a lista de professores e verificando credenciais no front.
   */
  async login(email: string, senha: string): Promise<Professor | null> {
    try {
      // 1. Busca a lista atualizada do backend (aguarda a requisição terminar)
      // Precisamos que o ProfessorService tenha o método .getAll() retornando Observable
      const professores = await firstValueFrom(this.professorService.getAll());

      // 2. Verifica se o usuário existe na lista baixada
      const usuarioEncontrado = professores.find(
        (user) => user.email === email && user.senha === senha
      );

      if (usuarioEncontrado) {
        this.currentUserSig.set(usuarioEncontrado);
        return usuarioEncontrado;
      }
    } catch (error) {
      console.error('Erro ao tentar fazer login (buscar professores)', error);
    }

    // Se falhar ou não encontrar
    this.currentUserSig.set(null);
    return null;
  }

  logout(): void {
    this.currentUserSig.set(null);
    this.router.navigate(['/login']);
  }

  public isCoordenador(): boolean {
    const currentUser = this.currentUserSig();
    return !!currentUser && currentUser.perfilProfessor === TipoProfessor.COORDENADOR;
  }

  public isProfessor(): boolean {
    const currentUser = this.currentUserSig();
    return !!currentUser && currentUser.perfilProfessor === TipoProfessor.PROFESSOR;
  }
}
