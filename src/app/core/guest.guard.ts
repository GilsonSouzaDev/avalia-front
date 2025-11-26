import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service'; // Ajuste o caminho conforme necessário

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.currentUserSig).pipe(
    map((user) => {
      // Se o usuário EXISTE (está logado), ele NÃO deve ver a tela de login
      if (user) {
        return router.createUrlTree(['/dashboard']);
      }
      // Se não tem usuário, libera o acesso ao Login
      return true;
    })
  );
};
