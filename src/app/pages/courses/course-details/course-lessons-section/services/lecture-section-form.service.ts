import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Lesson } from '../../../../../models/lesson.model';
import { CourseDetailsDataService } from '../../course-details-data.service';
import { LessonWithLectures } from '../course-lessons-section';

/**
 * Сервис для управления формой отдела лекций (Lesson с kind='lecture')
 */
@Injectable()
export class LectureSectionFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: [''], // Описание отдела (необязательное)
  });

  openAdd(): void {
    this.showForm.set(true);
    this.editingId.set(null);
    this.error.set(null);
    this.form.reset({ title: '', content: '' });
  }

  openEdit(section: Lesson): void {
    this.showForm.set(true);
    this.editingId.set(section.id);
    this.error.set(null);
    this.form.reset({ title: section.title ?? '', content: section.content ?? '' });
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
      const contentValue = this.form.controls.content.value || '';
      const createdOrUpdated = editingId
        ? await firstValueFrom(
            this.dataService.updateLesson(editingId, {
              title: this.form.controls.title.value,
              content: contentValue,
            }),
          )
        : await firstValueFrom(
            this.dataService.createLesson({
              courseId,
              title: this.form.controls.title.value,
              content: contentValue,
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
          kind: 'lecture', // Отдел лекций
          lectures: [],
        };
        this.cancel();
        return [next, ...currentLessons];
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to save lecture section');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteSection(
    sectionId: string,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (!confirm('Удалить отдел лекций? Все лекции внутри будут удалены.')) return null;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteLesson(sectionId));
      if (this.editingId() === sectionId) this.cancel();
      return currentLessons.filter((l) => l.id !== sectionId);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete lecture section');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }
}
