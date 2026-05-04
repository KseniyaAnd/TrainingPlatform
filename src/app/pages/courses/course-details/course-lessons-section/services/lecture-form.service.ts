import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CourseDetailsDataService } from '../../course-details-data.service';
import { LessonWithLectures } from '../course-lessons-section';

@Injectable()
export class LectureFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly showForm = signal(false);
  readonly lessonId = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    videoUrl: [''],
    content: [''],
  });

  openAdd(lessonId: string): void {
    this.showForm.set(true);
    this.lessonId.set(lessonId);
    this.editingId.set(null);
    this.error.set(null);
    this.form.reset({ title: '', videoUrl: '', content: '' });
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

    if ((hasVideo && hasContent) || (!hasVideo && !hasContent)) {
      this.error.set('Укажите либо видео, либо текст');
      return null;
    }

    this.error.set(null);
    try {
      this.submitting.set(true);
      const created = await firstValueFrom(
        this.dataService.createLecture({
          lessonId,
          title: this.form.controls.title.value,
          videoUrl: hasVideo ? videoUrl : undefined,
          content: hasContent ? content : undefined,
        }),
      );

      const updated = currentLessons.map((l) =>
        l.id === lessonId ? { ...l, lectures: [...(l.lectures ?? []), created] } : l,
      );
      this.cancel();
      return updated;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Не удалось создать лекцию');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }
}
