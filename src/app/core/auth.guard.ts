// src/app/core/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  return toObservable(authService.currentUserSig).pipe(
    map((user) => {
      if (user) {
        return true;
      }
    
      return router.createUrlTree(['/login']);
    })
  );
};
