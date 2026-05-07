import { Injectable, inject } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Lecture } from '../../../../../models/lecture.model';
import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { LessonWithLectures } from '../../../../../models/lesson-with-lectures.model';
import { BaseFormService } from '../../../../../shared/services/base-form.service';

@Injectable()
export class LectureFormService extends BaseFormService<Lecture> {
  private readonly dataService = inject(CourseDataService);

  readonly form = this.fb.nonNullable.group({
    lessonId: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    videoUrl: [''],
    content: [''],
  });

  createForm(data?: Lecture): FormGroup {
    return this.fb.nonNullable.group({
      lessonId: [data?.lessonId ?? '', [Validators.required]],
      title: [data?.title ?? '', [Validators.required, Validators.minLength(3)]],
      videoUrl: [data?.videoUrl ?? ''],
      content: [data?.content ?? ''],
    });
  }

  openAddLecture(lessonId: string): void {
    super.openAdd();
    this.form.reset({ lessonId, title: '', videoUrl: '', content: '' });
  }

  openEditLecture(lecture: Lecture): void {
    super.openEdit(lecture.id);
    this.form.reset({
      lessonId: lecture.lessonId,
      title: lecture.title ?? '',
      videoUrl: lecture.videoUrl ?? '',
      content: lecture.content ?? '',
    });
  }

  async submit(currentLessons: LessonWithLectures[]): Promise<LessonWithLectures[] | null> {
    if (this.form.invalid || this.submitting()) return null;

    const lessonId = this.form.controls.lessonId.value;
    const videoUrl = this.form.controls.videoUrl.value.trim();
    const content = this.form.controls.content.value.trim();
    const hasVideo = Boolean(videoUrl);
    const hasContent = Boolean(content);

    if ((hasVideo && hasContent) || (!hasVideo && !hasContent)) {
      this.setError('Укажите либо видео, либо текст');
      return null;
    }

    this.setError(null);
    try {
      this.setSubmitting(true);
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
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }

  async deleteLecture(
    lecture: Lecture,
    currentLessons: LessonWithLectures[],
  ): Promise<LessonWithLectures[] | null> {
    if (!confirm('Удалить лекцию?')) return null;
    try {
      this.setSubmitting(true);
      await firstValueFrom(this.dataService.deleteLecture(lecture.id));
      if (this.editingId() === lecture.id) this.cancel();
      return currentLessons.map((l) =>
        l.id === lecture.lessonId
          ? { ...l, lectures: (l.lectures ?? []).filter((x) => x.id !== lecture.id) }
          : l,
      );
    } catch (e) {
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }
}
