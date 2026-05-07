import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CourseDataService } from '../../../../services/courses/course-data.service';
import { CourseDetailsStateService } from './course-details-state.service';

/**
 * Сервис для операций с курсом (обновление, удаление)
 */
@Injectable()
export class CourseOperationsService {
  private readonly dataService = inject(CourseDataService);
  private readonly state = inject(CourseDetailsStateService);
  private readonly router = inject(Router);

  /**
   * Сохранить изменения курса
   */
  async submitCourse(courseId: string): Promise<void> {
    if (this.state.courseForm.invalid || this.state.submitting()) return;

    this.state.setSubmitError(null);
    this.state.setSubmitting(true);

    try {
      const updated = await firstValueFrom(
        this.dataService.updateCourse(courseId, {
          title: this.state.courseForm.controls['title'].value,
          description: this.state.courseForm.controls['description'].value,
        }),
      );
      this.state.updateCourse(updated);
      this.state.closeEditForm();
    } catch (e) {
      this.state.setSubmitError(e instanceof Error ? e.message : 'Failed to update course');
    } finally {
      this.state.setSubmitting(false);
    }
  }

  /**
   * Удалить курс
   */
  async deleteCourse(courseId: string): Promise<void> {
    if (!confirm('Удалить курс?')) return;

    this.state.setSubmitting(true);
    try {
      await firstValueFrom(this.dataService.deleteCourse(courseId));
      await this.router.navigateByUrl('/courses');
    } catch (e) {
      this.state.setSubmitError(e instanceof Error ? e.message : 'Failed to delete course');
    } finally {
      this.state.setSubmitting(false);
    }
  }
}
