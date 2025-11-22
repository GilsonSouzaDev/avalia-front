import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TipoProfessor } from '../interfaces/Professor';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';

export function roleGuard(expectedRole: TipoProfessor): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return toObservable(authService.currentUserSig).pipe(
      map((user) => {
        if (user && user.perfilProfessor === expectedRole) {
          return true;
        }
        return router.createUrlTree(['/login']);
      })
    );
  };
}
