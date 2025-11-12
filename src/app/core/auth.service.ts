// src/app/core/auth.service.ts

import { Injectable, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Professor, TipoProfessor } from '../interfaces/Professor';
import { MOCK_PROFESSORES } from '../data/mock-data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUserSig = signal<Professor | null | undefined>(undefined);
  private readonly storageKey = 'currentUser';

  constructor(private router: Router) {
    this.loadUserFromStorage();

    effect(() => {
      const user = this.currentUserSig();
      if (user) {
        sessionStorage.setItem(this.storageKey, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(this.storageKey);
      }
    });
  }

  private loadUserFromStorage(): void {
    const userJson = sessionStorage.getItem(this.storageKey);
    if (userJson) {
      this.currentUserSig.set(JSON.parse(userJson));
    } else {
      this.currentUserSig.set(null);
    }
  }

  login(email: string, senha: string): Professor | null {
    const usuarioEncontrado = MOCK_PROFESSORES.find(
      (user) => user.email === email && user.senha === senha
    );

    if (usuarioEncontrado) {
      this.currentUserSig.set(usuarioEncontrado);
      return usuarioEncontrado;
    }

    this.currentUserSig.set(null);
    return null;
  }

  logout(): void {
    this.currentUserSig.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica se o usuário logado tem o perfil de COORDENADOR.
   * @returns true se o usuário for COORDENADOR, caso contrário, false.
   */
  public isCoordenador(): boolean {
    // computed() poderia ser usado aqui para otimização, mas um método simples é suficiente.
    const currentUser = this.currentUserSig();
    return !!currentUser && currentUser.tipo === TipoProfessor.COORDENADOR;
  }

  /**
   * Verifica se o usuário logado tem o perfil de PROFESSOR.
   * @returns true se o usuário for PROFESSOR, caso contrário, false.
   */
  public isProfessor(): boolean {
    const currentUser = this.currentUserSig();
    return !!currentUser && currentUser.tipo === TipoProfessor.PROFESSOR;
  }
}
