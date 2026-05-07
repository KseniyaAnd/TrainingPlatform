import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';

/**
 * Guard для проверки роли пользователя.
 * Использует данные маршрута для определения разрешенных ролей.
 *
 * Пример использования в маршруте:
 * {
 *   path: 'courses/create',
 *   component: CreateCoursePage,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['TEACHER', 'ADMIN'] }
 * }
 */
export const roleGuard: CanActivateFn = (route) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  const userRole = authStateService.role();
  const allowedRoles = route.data['roles'] as string[] | undefined;

  // Если роли не указаны, разрешаем доступ
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Проверяем, есть ли роль пользователя в списке разрешенных
  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Если доступ запрещен, перенаправляем на главную страницу
  router.navigate(['/']);
  return false;
};
