import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';

/**
 * Guard для проверки прав преподавателя.
 * Разрешает доступ преподавателям и администраторам.
 * Если пользователь не имеет соответствующих прав, перенаправляет на главную страницу.
 */
export const teacherGuard: CanActivateFn = () => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  const userRole = authStateService.role();

  if (userRole === 'TEACHER' || userRole === 'ADMIN') {
    return true;
  }

  // Перенаправляем на главную страницу, если пользователь не преподаватель/администратор
  router.navigate(['/']);
  return false;
};
