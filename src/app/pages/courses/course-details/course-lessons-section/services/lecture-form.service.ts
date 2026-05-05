import { inject, Injectable, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CourseDetailsDataService } from '../../course-details-data.service';
import { LessonWithLectures } from '../course-lessons-section';

// Custom validator: either videoUrl or content must be provided, but not both
function videoOrContentValidator(control: AbstractControl): ValidationErrors | null {
  const videoUrl = control.get('videoUrl')?.value?.trim() || '';
  const content = control.get('content')?.value?.trim() || '';
  const hasVideo = Boolean(videoUrl);
  const hasContent = Boolean(content);

  if ((hasVideo && hasContent) || (!hasVideo && !hasContent)) {
    return { videoOrContent: true };
  }
  return null;
}

@Injectable()
export class LectureFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly showForm = signal(false);
  readonly lessonId = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(3)]],
      videoUrl: [''],
      content: [''],
    },
    { validators: videoOrContentValidator },
  );

  openAdd(lessonId: string): void {
    this.showForm.set(true);
    this.lessonId.set(lessonId);
    this.editingId.set(null);
    this.error.set(null);
    this.form.reset({ title: '', videoUrl: '', content: '' });
  }

  openEdit(lecture: any, lessonId: string): void {
    this.showForm.set(true);
    this.lessonId.set(lessonId);
    this.editingId.set(lecture.id);
    this.error.set(null);
    this.form.reset({
      title: lecture.title ?? '',
      videoUrl: lecture.videoUrl ?? '',
      content: lecture.content ?? '',
    });
  }

  cancel(): void {
    this.showForm.set(false);
    this.lessonId.set(null);
    this.editingId.set(null);
    this.error.set(null);
  }

  async submit(currentLessons: LessonWithLectures[]): Promise<LessonWithLectures[] | null> {
    if (this.form.invalid || this.submitting()) return null;

    const lessonId = this.lessonId();
    if (!lessonId) {
      this.error.set('Lesson ID не найден');
      return null;
    }

    const videoUrl = this.form.controls.videoUrl.value.trim();
    const content = this.form.controls.content.value.trim();
    const hasVideo = Boolean(videoUrl);
    const hasContent = Boolean(content);

    this.error.set(null);
    try {
      this.submitting.set(true);
      const editingId = this.editingId();

      if (editingId) {
        // Редактирование существующей лекции
        const updated = await firstValueFrom(
          this.dataService.updateLecture(editingId, {
            title: this.form.controls.title.value,
            videoUrl: hasVideo ? videoUrl : undefined,
            content: hasContent ? content : undefined,
          }),
        );

        const result = currentLessons.map((lesson) => {
          if (lesson.id === lessonId) {
            return {
              ...lesson,
              lectures: lesson.lectures.map((lec) => (lec.id === editingId ? updated : lec)),
            };
          }
          return lesson;
        });
        this.cancel();
        return result;
      } else {
        // Создание новой лекции
        const created = await firstValueFrom(
          this.dataService.createLecture({
            lessonId,
            title: this.form.controls.title.value,
            videoUrl: hasVideo ? videoUrl : undefined,
            content: hasContent ? content : undefined,
          }),
        );

        const result = currentLessons.map((l) =>
          l.id === lessonId ? { ...l, lectures: [...(l.lectures ?? []), created] } : l,
        );
        this.cancel();
        return result;
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Не удалось сохранить лекцию');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }
}
