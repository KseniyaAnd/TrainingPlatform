import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();

  if (token) {
    try {
      const payload = authService.parseToken(token);
      const exp = payload.exp;
      if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
        authService.logout();
        void router.navigateByUrl('/');
        return next(req);
      }
    } catch {
      authService.logout();
      void router.navigateByUrl('/');
      return next(req);
    }
  }

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned).pipe(
      catchError((err) => {
        if (err?.status === 401) {
          authService.logout();
          void router.navigateByUrl('/');
        }
        return throwError(() => err);
      }),
    );
  }

  return next(req);
};
