import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';

/**
 * Guard для проверки авторизации пользователя.
 * Если пользователь не авторизован, перенаправляет на страницу входа.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  const isAuthenticated = authStateService.isAuthenticated();

  if (!isAuthenticated) {
    // Сохраняем URL, на который пользователь пытался попасть
    const returnUrl = state.url;
    router.navigate(['/login'], {
      queryParams: { returnUrl },
    });
    return false;
  }

  return true;
};
