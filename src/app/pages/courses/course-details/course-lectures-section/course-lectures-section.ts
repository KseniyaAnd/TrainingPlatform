import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Lecture } from '../../../../models/lecture.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { CourseDetailsDataService } from '../course-details-data.service';
import { LessonWithLectures } from '../course-lessons-section/course-lessons-section';

@Component({
  selector: 'app-course-lectures-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, CardModule, TagModule, MessageModule],
  templateUrl: './course-lectures-section.html',
  styles: `
    :host ::ng-deep .p-card .black-color {
      color: #111827 !important;
    }
  `,
})
export class CourseLecturesSectionComponent {
  readonly lessons = input.required<LessonWithLectures[]>();
  /** Pre-selected lesson id when opening form from lesson card */
  readonly initialLessonId = input<string | null>(null);

  readonly lessonsChange = output<LessonWithLectures[]>();

  private readonly dataService = inject(CourseDetailsDataService);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });

  readonly lessonsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lesson'));
  readonly allLectures = computed(() => this.lessons().flatMap((l) => l.lectures ?? []));

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

  openAdd(lessonId?: string): void {
    const firstId = lessonId ?? this.lessonsOnly()[0]?.id;
    if (!firstId) {
      this.error.set('Сначала добавьте урок');
      return;
    }
    this.showForm.set(true);
    this.editingId.set(null);
    this.error.set(null);
    this.form.reset({ lessonId: firstId, title: '', videoUrl: '', content: '' });
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

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) return;

    const lessonId = this.form.controls.lessonId.value;
    const videoUrl = this.form.controls.videoUrl.value.trim();
    const content = this.form.controls.content.value.trim();
    const hasVideo = Boolean(videoUrl);
    const hasContent = Boolean(content);

    if ((hasVideo && hasContent) || (!hasVideo && !hasContent)) {
      this.error.set('Укажите либо видео, либо текст');
      return;
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

      this.lessonsChange.emit(
        this.lessons().map((l) =>
          l.id === lessonId
            ? {
                ...l,
                lectures: editingId
                  ? (l.lectures ?? []).map((x) => (x.id === editingId ? saved : x))
                  : [saved, ...(l.lectures ?? [])],
              }
            : l,
        ),
      );
      this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to save lecture');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteLecture(lecture: Lecture): Promise<void> {
    if (!confirm('Удалить лекцию?')) return;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteLecture(lecture.id));
      this.lessonsChange.emit(
        this.lessons().map((l) =>
          l.id === lecture.lessonId
            ? { ...l, lectures: (l.lectures ?? []).filter((x) => x.id !== lecture.id) }
            : l,
        ),
      );
      if (this.editingId() === lecture.id) this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete lecture');
    } finally {
      this.submitting.set(false);
    }
  }
}
