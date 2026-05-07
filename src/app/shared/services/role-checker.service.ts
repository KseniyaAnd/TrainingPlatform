import { computed, inject, Injectable } from '@angular/core';

import { AuthStateService } from '../../services/auth/auth-state.service';

/**
 * Сервис для проверки ролей и авторизации пользователя.
 * Централизует логику проверки ролей, избегая дублирования кода.
 */
@Injectable({ providedIn: 'root' })
export class RoleCheckerService {
  private readonly authState = inject(AuthStateService);

  // Базовые проверки авторизации
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly username = this.authState.username;
  readonly userId = computed(() => this.authState.getUserId());

  // Проверки ролей
  readonly isAdmin = computed(() => this.authState.role() === 'ADMIN');
  readonly isTeacher = computed(() => this.authState.role() === 'TEACHER');
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');

  // Комбинированные проверки
  readonly canManageCourses = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });

  readonly canAccessAdminPanel = computed(() => this.authState.role() === 'ADMIN');

  /**
   * Проверить, имеет ли пользователь одну из указанных ролей
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.authState.role();
    return userRole !== null && roles.includes(userRole);
  }

  /**
   * Проверить, имеет ли пользователь конкретную роль
   */
  hasRole(role: string): boolean {
    return this.authState.role() === role;
  }

  /**
   * Получить текущую роль пользователя
   */
  getCurrentRole(): string | null {
    return this.authState.role();
  }
}
