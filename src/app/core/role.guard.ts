import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TipoProfessor } from '../interfaces/Professor'; // Ajuste o caminho
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export function roleGuard(expectedRole: TipoProfessor): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return toObservable(authService.currentUserSig).pipe(
      map((user) => {
        // Verifica se o usuário está logado E se tem o perfil esperado
        if (user && user.tipo === expectedRole) {
          return true;
        }

        // Se não tiver permissão, redireciona para uma página de 'acesso negado' ou para o login
        // Poderíamos também redirecionar para uma página inicial do dashboard do usuário.
        console.error(
          `Acesso negado. Rota requer perfil: ${expectedRole}, usuário tem perfil: ${user?.tipo}`
        );
        return router.createUrlTree(['/login']);
      })
    );
  };
}
