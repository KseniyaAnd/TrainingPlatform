import { Injectable, inject, signal } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { LessonWithLectures } from '../../../../../models/lesson-with-lectures.model';
import { BaseFormService } from '../../../../../shared/services/base-form.service';

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
export class LectureFormService extends BaseFormService {
  private readonly dataService = inject(CourseDataService);

  readonly lessonId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(3)]],
      videoUrl: [''],
      content: [''],
    },
    { validators: videoOrContentValidator },
  );

  createForm(data?: any): FormGroup {
    return this.fb.nonNullable.group(
      {
        title: [data?.title ?? '', [Validators.required, Validators.minLength(3)]],
        videoUrl: [data?.videoUrl ?? ''],
        content: [data?.content ?? ''],
      },
      { validators: videoOrContentValidator },
    );
  }

  openAddLecture(lessonId: string): void {
    super.openAdd();
    this.lessonId.set(lessonId);
    this.form.reset({ title: '', videoUrl: '', content: '' });
  }

  openEditLecture(lecture: any, lessonId: string): void {
    super.openEdit(lecture.id);
    this.lessonId.set(lessonId);
    this.form.reset({
      title: lecture.title ?? '',
      videoUrl: lecture.videoUrl ?? '',
      content: lecture.content ?? '',
    });
  }

  override cancel(): void {
    super.cancel();
    this.lessonId.set(null);
  }

  async submit(currentLessons: LessonWithLectures[]): Promise<LessonWithLectures[] | null> {
    if (this.form.invalid || this.submitting()) return null;

    const lessonId = this.lessonId();
    if (!lessonId) {
      this.setError('Lesson ID не найден');
      return null;
    }

    const videoUrl = this.form.controls.videoUrl.value.trim();
    const content = this.form.controls.content.value.trim();
    const hasVideo = Boolean(videoUrl);
    const hasContent = Boolean(content);

    this.setError(null);
    try {
      this.setSubmitting(true);
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
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }
}
