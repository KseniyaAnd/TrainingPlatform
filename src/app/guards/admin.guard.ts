import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';

/**
 * Guard для проверки прав администратора.
 * Если пользователь не является администратором, перенаправляет на главную страницу.
 */
export const adminGuard: CanActivateFn = () => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  const userRole = authStateService.role();

  if (userRole === 'ADMIN') {
    return true;
  }

  // Перенаправляем на главную страницу, если пользователь не администратор
  router.navigate(['/']);
  return false;
};
