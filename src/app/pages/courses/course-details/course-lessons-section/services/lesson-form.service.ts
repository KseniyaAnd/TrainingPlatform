import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Lesson } from '../../../../../models/lesson.model';
import { CourseDetailsDataService } from '../../course-details-data.service';
import { LessonWithLectures } from '../course-lessons-section';

/**
 * Сервис для управления формой урока (создание/редактирование)
 */
@Injectable()
export class LessonFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  openAdd(): void {
    this.showForm.set(true);
    this.editingId.set(null);
    this.error.set(null);
    this.form.reset({ title: '', content: '' });
  }

  openEdit(lesson: Lesson): void {
    this.showForm.set(true);
    this.editingId.set(lesson.id);
    this.error.set(null);
    this.form.reset({ title: lesson.title ?? '', content: lesson.content ?? '' });
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.error.set(null);
  }

  async submit(
    courseId: string,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (this.form.invalid || this.submitting()) return null;
    this.error.set(null);

    try {
      this.submitting.set(true);
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
      this.error.set(e instanceof Error ? e.message : 'Failed to save lesson');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteLesson(
    lessonId: string,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (!confirm('Удалить урок?')) return null;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteLesson(lessonId));
      if (this.editingId() === lessonId) this.cancel();
      return currentLessons.filter((l) => l.id !== lessonId);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete lesson');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }
}
