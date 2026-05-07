import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../../models/assessment.model';
import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { LessonWithLectures } from '../../../../../models/lesson-with-lectures.model';

/**
 * Сервис для действий с уроками, лекциями и assessments
 * Отвечает за: удаление, навигацию
 */
@Injectable()
export class TeacherLessonsActionsService {
  private readonly dataService = inject(CourseDataService);
  private readonly router = inject(Router);

  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);

  /**
   * Удалить лекцию
   */
  async deleteLecture(
    lectureId: string,
    lessonId: string,
    lessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (!confirm('Удалить лекцию?')) return null;

    this.deleting.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.dataService.deleteLecture(lectureId));

      const updated = lessons.map((lesson) => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            lectures: lesson.lectures.filter((lec) => lec.id !== lectureId),
          };
        }
        return lesson;
      });

      return updated;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete lecture');
      return null;
    } finally {
      this.deleting.set(false);
    }
  }

  /**
   * Удалить assessment
   */
  async deleteAssessment(
    assessmentId: string,
    assessments: Assessment[],
  ): Promise<Assessment[] | null> {
    if (!confirm('Удалить assessment?')) return null;

    this.deleting.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.dataService.deleteAssessment(assessmentId));
      return assessments.filter((x) => x.id !== assessmentId);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete assessment');
      return null;
    } finally {
      this.deleting.set(false);
    }
  }

  /**
   * Перейти к оценке assessment
   */
  navigateToGrading(assessmentId: string): void {
    void this.router.navigate(['/assessments', assessmentId, 'grade']);
  }

  /**
   * Сбросить ошибку
   */
  clearError(): void {
    this.error.set(null);
  }
}
