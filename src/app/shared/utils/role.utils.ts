/**
 * Утилиты для работы с ролями пользователей
 */

export type RoleSeverity = 'warn' | 'info' | 'success' | 'secondary';

/**
 * Получить severity для отображения роли в UI
 */
export function getRoleSeverity(role: string): RoleSeverity {
  switch (role) {
    case 'ADMIN':
      return 'warn';
    case 'TEACHER':
      return 'info';
    case 'STUDENT':
      return 'success';
    default:
      return 'secondary';
  }
}

/**
 * Получить локализованное название роли
 */
export function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Администратор';
    case 'TEACHER':
      return 'Преподаватель';
    case 'STUDENT':
      return 'Студент';
    default:
      return role;
  }
}
