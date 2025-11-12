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
        if (user && user.tipo === expectedRole) {
          return true;
        }

        console.error(
          `Acesso negado. Rota requer perfil: ${expectedRole}, usuário tem perfil: ${user?.tipo}`
        );
        return router.createUrlTree(['/login']);
      })
    );
  };
}
