// src/app/core/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usamos toObservable para converter o signal em um Observable
  return toObservable(authService.currentUserSig).pipe(
    map((user) => {
      if (user) {
        return true; // Usuário está logado, permite acesso
      }
      // Usuário não está logado, redireciona para /login
      return router.createUrlTree(['/login']);
    })
  );
};
