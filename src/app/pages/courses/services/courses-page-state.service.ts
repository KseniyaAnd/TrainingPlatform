import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CourseWithEnrollment } from '../../../models/course.model';
import { CoursesService } from '../../../services/courses/courses.service';
import { RoleCheckerService } from '../../../shared/services/role-checker.service';

/**
 * Сервис для управления состоянием страницы курсов
 * Отвечает за загрузку данных и управление пагинацией
 */
@Injectable()
export class CoursesPageStateService {
  private readonly coursesService = inject(CoursesService);
  private readonly roleChecker = inject(RoleCheckerService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  readonly scope = signal<string | null>(null);
  readonly searchQuery = signal<string | null>(null);

  readonly isMyCoursesScope = computed(() => this.scope() === 'me');
  readonly isTeacher = this.roleChecker.isTeacher;
  readonly isStudent = this.roleChecker.isStudent;

  /**
   * Загрузить первую страницу курсов
   */
  async loadFirstPage(
    scope: string | null,
    searchQuery: string | null,
    onCoursesLoaded: (courses: CourseWithEnrollment[], nextCursor: string | null) => void,
  ): Promise<void> {
    this.scope.set(scope);
    this.searchQuery.set(searchQuery);
    this.nextCursor.set(null);
    this.error.set(null);
    await this.loadPage(null, onCoursesLoaded);
  }

  /**
   * Загрузить следующую страницу курсов
   */
  async loadMore(
    onCoursesLoaded: (courses: CourseWithEnrollment[], nextCursor: string | null) => void,
  ): Promise<void> {
    const cursor = this.nextCursor();
    if (!cursor || this.loading()) return;
    await this.loadPage(cursor, onCoursesLoaded);
  }

  /**
   * Загрузить страницу курсов
   */
  private async loadPage(
    cursor: string | null,
    onCoursesLoaded: (courses: CourseWithEnrollment[], nextCursor: string | null) => void,
  ): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const q = this.searchQuery();
      const role = this.roleChecker.getCurrentRole();
      const scope = this.scope();

      if (scope === 'me') {
        await this.loadMyCoursesPage(cursor, q, role, onCoursesLoaded);
      } else {
        await this.loadAllCoursesPage(cursor, q, role, onCoursesLoaded);
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to load courses');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Загрузить страницу "Мои курсы"
   */
  private async loadMyCoursesPage(
    cursor: string | null,
    q: string | null,
    role: string | null,
    onCoursesLoaded: (courses: CourseWithEnrollment[], nextCursor: string | null) => void,
  ): Promise<void> {
    if (role === 'STUDENT') {
      const response = await firstValueFrom(
        this.coursesService.getEnrolledCourses({ limit: 20, cursor, q }),
      );
      const coursesWithEnrollment: CourseWithEnrollment[] = response.items.map((enrollment) => ({
        ...enrollment.course,
        isEnrolled: true,
        enrollmentId: enrollment.enrollmentId,
      }));
      onCoursesLoaded(coursesWithEnrollment, response.page?.nextCursor ?? null);
      this.nextCursor.set(response.page?.nextCursor ?? null);
    } else {
      const response = await firstValueFrom(
        this.coursesService.getMyCourses({ limit: 20, cursor, q }),
      );
      const coursesWithEnrollment: CourseWithEnrollment[] = response.items.map((course) => ({
        ...course,
        isEnrolled: false,
        enrollmentId: null,
      }));
      onCoursesLoaded(coursesWithEnrollment, response.page?.nextCursor ?? null);
      this.nextCursor.set(response.page?.nextCursor ?? null);
    }
  }

  /**
   * Загрузить страницу "Все курсы"
   */
  private async loadAllCoursesPage(
    cursor: string | null,
    q: string | null,
    role: string | null,
    onCoursesLoaded: (courses: CourseWithEnrollment[], nextCursor: string | null) => void,
  ): Promise<void> {
    if (role === 'STUDENT' && !cursor) {
      const coursesWithEnrollment = await firstValueFrom(
        this.coursesService.loadCoursesWithEnrollmentStatus({ limit: 20, cursor, q }),
      );
      onCoursesLoaded(coursesWithEnrollment, null);
      this.nextCursor.set(null); // For simplicity, disable pagination when using combined load
    } else {
      const response = await firstValueFrom(
        this.coursesService.getCourses({ limit: 20, cursor, q }),
      );
      const coursesWithEnrollment: CourseWithEnrollment[] = response.items.map((course) => ({
        ...course,
        isEnrolled: false,
        enrollmentId: null,
      }));
      onCoursesLoaded(coursesWithEnrollment, response.page?.nextCursor ?? null);
      this.nextCursor.set(response.page?.nextCursor ?? null);
    }
  }
}
