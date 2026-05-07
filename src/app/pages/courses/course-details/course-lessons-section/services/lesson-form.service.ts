import { Injectable, inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Lesson } from '../../../../../models/lesson.model';
import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { LessonWithLectures } from '../../../../../models/lesson-with-lectures.model';
import { BaseFormService } from '../../../../../shared/services/base-form.service';

/**
 * Сервис для управления формой урока (создание/редактирование)
 */
@Injectable()
export class LessonFormService extends BaseFormService<Lesson> {
  private readonly dataService = inject(CourseDataService);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  createForm(data?: Lesson): FormGroup {
    return this.fb.nonNullable.group({
      title: [data?.title ?? '', [Validators.required, Validators.minLength(3)]],
      content: [data?.content ?? '', [Validators.required, Validators.minLength(1)]],
    });
  }

  openAddLesson(): void {
    super.openAdd();
    this.form.reset({ title: '', content: '' });
  }

  openEditLesson(lesson: Lesson): void {
    super.openEdit(lesson.id);
    this.form.reset({ title: lesson.title ?? '', content: lesson.content ?? '' });
  }

  async submit(
    courseId: string,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (this.form.invalid || this.submitting()) return null;
    this.setError(null);

    try {
      this.setSubmitting(true);
      const editingId = this.editingId();
      const createdOrUpdated = editingId
        ? await firstValueFrom(
            this.dataService.updateLesson(editingId, {
              title: this.form.controls.title.value,
              content: this.form.controls.content.value,
            }),
          )
        : await firstValueFrom(
            this.dataService.createLesson({
              courseId,
              title: this.form.controls.title.value,
              content: this.form.controls.content.value,
            }),
          );

      if (editingId) {
        const updated = currentLessons.map((l) =>
          l.id === editingId ? { ...l, ...createdOrUpdated, lectures: l.lectures ?? [] } : l,
        );
        this.cancel();
        return updated;
      } else {
        const next: LessonWithLectures = {
          ...createdOrUpdated,
          kind: createdOrUpdated.kind ?? 'lesson',
          lectures: [],
        };
        this.cancel();
        return [...currentLessons, next];
      }
    } catch (e) {
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }

  async deleteLesson(
    lessonId: string,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (!confirm('Удалить урок?')) return null;
    try {
      this.setSubmitting(true);
      await firstValueFrom(this.dataService.deleteLesson(lessonId));
      if (this.editingId() === lessonId) this.cancel();
      return currentLessons.filter((l) => l.id !== lessonId);
    } catch (e) {
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }
}
