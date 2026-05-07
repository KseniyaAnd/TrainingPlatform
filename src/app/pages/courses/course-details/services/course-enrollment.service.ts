import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CourseDataService } from '../../../../services/courses/course-data.service';

/**
 * Сервис для управления подпиской на курс
 * Отвечает за: enroll, unenroll, проверку статуса подписки
 */
@Injectable()
export class CourseEnrollmentService {
  private readonly dataService = inject(CourseDataService);

  // State
  readonly subscribed = signal(false);
  readonly enrollmentId = signal<string | null>(null);
  readonly enrolling = signal(false);
  readonly enrollmentError = signal<string | null>(null);

  /**
   * Проверить статус подписки на курс
   */
  async checkEnrollmentStatus(courseId: string): Promise<void> {
    try {
      const enrollment = await firstValueFrom(this.dataService.checkEnrollmentStatus(courseId));
      this.subscribed.set(enrollment.isEnrolled);
      this.enrollmentId.set(enrollment.enrollmentId);
    } catch (e) {
      console.error('Failed to check enrollment status:', e);
      this.subscribed.set(false);
      this.enrollmentId.set(null);
    }
  }

  /**
   * Подписаться на курс
   * @returns true если успешно, false если ошибка
   */
  async enroll(courseId: string): Promise<boolean> {
    if (this.subscribed() || this.enrolling()) return false;

    this.enrolling.set(true);
    this.enrollmentError.set(null);

    try {
      await firstValueFrom(this.dataService.enroll(courseId));
      this.subscribed.set(true);
      return true;
    } catch (e: any) {
      // Если уже подписан (409 Conflict)
      if (e?.status === 409) {
        this.subscribed.set(true);
        return true;
      }
      this.enrollmentError.set(e instanceof Error ? e.message : 'Failed to enroll');
      return false;
    } finally {
      this.enrolling.set(false);
    }
  }

  /**
   * Отписаться от курса
   * @returns true если успешно, false если ошибка или отменено
   */
  async unenroll(enrollmentId: string): Promise<boolean> {
    if (!this.subscribed() || this.enrolling()) return false;

    if (!confirm('Вы уверены, что хотите отписаться от курса? Ваш прогресс будет сохранен.')) {
      return false;
    }

    this.enrolling.set(true);
    this.enrollmentError.set(null);

    try {
      await firstValueFrom(this.dataService.unenroll(enrollmentId));
      this.subscribed.set(false);
      this.enrollmentId.set(null);
      return true;
    } catch (e: any) {
      this.enrollmentError.set(e instanceof Error ? e.message : 'Failed to unenroll');
      return false;
    } finally {
      this.enrolling.set(false);
    }
  }

  /**
   * Сбросить состояние сервиса
   */
  reset(): void {
    this.subscribed.set(false);
    this.enrollmentId.set(null);
    this.enrolling.set(false);
    this.enrollmentError.set(null);
  }
}
