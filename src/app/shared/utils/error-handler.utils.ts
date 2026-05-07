/**
 * Утилиты для обработки ошибок
 */

/**
 * Обработать ошибку загрузки данных
 * @param error - объект ошибки
 * @param context - контекст операции (например, "users", "courses")
 * @param customMessage - кастомное сообщение об ошибке
 */
export function handleLoadError(error: any, context: string, customMessage?: string): string {
  console.error(`Failed to load ${context}:`, error);

  if (customMessage) {
    return customMessage;
  }

  // Стандартные сообщения на основе контекста
  const messages: Record<string, string> = {
    users: 'Не удалось загрузить список пользователей',
    courses: 'Не удалось загрузить список курсов',
    'user details': 'Не удалось загрузить данные пользователя',
    'platform statistics': 'Не удалось загрузить статистику платформы',
    submissions: 'Не удалось загрузить список работ',
    course: 'Не удалось загрузить курс',
  };

  return messages[context] || `Не удалось загрузить ${context}`;
}

/**
 * Извлечь сообщение об ошибке из объекта Error или строки
 */
export function extractErrorMessage(error: any, fallback = 'Произошла ошибка'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

/**
 * Проверить, является ли ошибка ошибкой авторизации
 */
export function isAuthError(error: any): boolean {
  const errorMessage = extractErrorMessage(error, '');
  return errorMessage.includes('401') || errorMessage.includes('403');
}
