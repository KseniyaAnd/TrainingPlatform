import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Lecture } from '../../../../../models/lecture.model';
import { CourseDetailsDataService } from '../../course-details-data.service';
import { LessonWithLectures } from '../../course-lessons-section/course-lessons-section';

@Injectable()
export class LectureFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    lessonId: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    videoUrl: [''],
    content: [''],
  });

  openAdd(lessonId: string): void {
    this.showForm.set(true);
    this.editingId.set(null);
    this.error.set(null);
    this.form.reset({ lessonId, title: '', videoUrl: '', content: '' });
  }

  openEdit(lecture: Lecture): void {
    this.showForm.set(true);
    this.editingId.set(lecture.id);
    this.error.set(null);
    this.form.reset({
      lessonId: lecture.lessonId,
      title: lecture.title ?? '',
      videoUrl: lecture.videoUrl ?? '',
      content: lecture.content ?? '',
    });
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.error.set(null);
  }

  async submit(currentLessons: LessonWithLectures[]): Promise<LessonWithLectures[] | null> {
    if (this.form.invalid || this.submitting()) return null;

    const lessonId = this.form.controls.lessonId.value;
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
      const editingId = this.editingId();
      const saved = editingId
        ? await firstValueFrom(
            this.dataService.updateLecture(editingId, {
              title: this.form.controls.title.value,
              videoUrl: hasVideo ? videoUrl : null,
              content: hasContent ? content : null,
            }),
          )
        : await firstValueFrom(
            this.dataService.createLecture({
              lessonId,
              title: this.form.controls.title.value,
              videoUrl: hasVideo ? videoUrl : null,
              content: hasContent ? content : null,
            }),
          );

      const updated = currentLessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              lectures: editingId
                ? (l.lectures ?? []).map((x) => (x.id === editingId ? saved : x))
                : [saved, ...(l.lectures ?? [])],
            }
          : l,
      );
      this.cancel();
      return updated;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to save lecture');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteLecture(
    lecture: Lecture,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (!confirm('Удалить лекцию?')) return null;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteLecture(lecture.id));
      if (this.editingId() === lecture.id) this.cancel();
      return currentLessons.map((l) =>
        l.id === lecture.lessonId
          ? { ...l, lectures: (l.lectures ?? []).filter((x) => x.id !== lecture.id) }
          : l,
      );
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete lecture');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }
}
