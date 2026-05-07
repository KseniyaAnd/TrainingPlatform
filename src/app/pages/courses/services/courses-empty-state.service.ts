import { inject, Injectable } from '@angular/core';

import { RoleCheckerService } from '../../../shared/services/role-checker.service';

export interface EmptyStateConfig {
  title: string;
  message: string;
  actionLabel: string | null;
  actionLink: string | null;
}

/**
 * Сервис для управления empty state на странице курсов
 */
@Injectable()
export class CoursesEmptyStateService {
  private readonly roleChecker = inject(RoleCheckerService);

  readonly isTeacher = this.roleChecker.isTeacher;
  readonly isStudent = this.roleChecker.isStudent;

  /**
   * Получить конфигурацию empty state для "Мои курсы"
   */
  getMyCoursesEmptyState(): EmptyStateConfig {
    if (this.isTeacher()) {
      return {
        title: 'Курсы не найдены',
        message: 'Вы еще не создали ни одного курса. Начните с создания вашего первого курса!',
        actionLabel: 'Создать первый курс',
        actionLink: '/courses/create',
      };
    } else if (this.isStudent()) {
      return {
        title: 'Курсы не найдены',
        message: 'Вы еще не записались ни на один курс. Изучите доступные курсы, чтобы начать.',
        actionLabel: 'Изучить курсы',
        actionLink: '/courses',
      };
    }

    return {
      title: 'Курсы не найдены',
      message: 'На данный момент курсы недоступны.',
      actionLabel: null,
      actionLink: null,
    };
  }

  /**
   * Получить конфигурацию empty state для "Все курсы"
   */
  getAllCoursesEmptyState(): EmptyStateConfig {
    return {
      title: 'Курсы не найдены',
      message: 'На данный момент курсы недоступны.',
      actionLabel: null,
      actionLink: null,
    };
  }

  /**
   * Получить конфигурацию empty state в зависимости от scope
   */
  getEmptyState(isMyCoursesScope: boolean): EmptyStateConfig {
    return isMyCoursesScope ? this.getMyCoursesEmptyState() : this.getAllCoursesEmptyState();
  }
}
