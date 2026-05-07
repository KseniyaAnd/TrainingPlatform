import { Injectable, inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Lesson } from '../../../../../models/lesson.model';
import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { LessonWithLectures } from '../../../../../models/lesson-with-lectures.model';
import { BaseFormService } from '../../../../../shared/services/base-form.service';

/**
 * Сервис для управления формой отдела лекций (Lesson с kind='lecture')
 */
@Injectable()
export class LectureSectionFormService extends BaseFormService<Lesson> {
  private readonly dataService = inject(CourseDataService);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: [''], // Описание отдела (необязательное)
  });

  createForm(data?: Lesson): FormGroup {
    return this.fb.nonNullable.group({
      title: [data?.title ?? '', [Validators.required, Validators.minLength(3)]],
      content: [data?.content ?? ''],
    });
  }

  openAddSection(): void {
    super.openAdd();
    this.form.reset({ title: '', content: '' });
  }

  openEditSection(section: Lesson): void {
    super.openEdit(section.id);
    this.form.reset({ title: section.title ?? '', content: section.content ?? '' });
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
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }

  async deleteSection(
    sectionId: string,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (!confirm('Удалить отдел лекций? Все лекции внутри будут удалены.')) return null;
    try {
      this.setSubmitting(true);
      await firstValueFrom(this.dataService.deleteLesson(sectionId));
      if (this.editingId() === sectionId) this.cancel();
      return currentLessons.filter((l) => l.id !== sectionId);
    } catch (e) {
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }
}
