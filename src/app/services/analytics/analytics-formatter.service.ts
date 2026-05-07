import { Injectable } from '@angular/core';

/**
 * Сервис для форматирования данных аналитики
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsFormatterService {
  /**
   * Получить иконку для тренда
   */
  getTrendIcon(trend: string | undefined): string {
    switch (trend) {
      case 'improving':
        return 'pi-arrow-up';
      case 'declining':
        return 'pi-arrow-down';
      case 'stable':
        return 'pi-minus';
      default:
        return 'pi-minus';
    }
  }

  /**
   * Получить цвет для тренда
   */
  getTrendColor(trend: string | undefined): string {
    switch (trend) {
      case 'improving':
        return 'text-emerald-600';
      case 'declining':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Получить текстовую метку для тренда
   */
  getTrendLabel(trend: string | undefined): string {
    switch (trend) {
      case 'improving':
        return 'Улучшается';
      case 'declining':
        return 'Ухудшается';
      case 'stable':
        return 'Стабильно';
      default:
        return 'Неизвестно';
    }
  }
}
