import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Lecture } from '../../../../models/lecture.model';
import { Lesson } from '../../../../models/lesson.model';
import { CourseProgressResponse } from '../../../../models/progress.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { CourseDetailsDataService } from '../course-details-data.service';

export type LessonWithLectures = Lesson & { lectures: Lecture[] };

@Component({
  selector: 'app-course-lessons-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, CardModule, TagModule, MessageModule],
  templateUrl: './course-lessons-section.html',
  styles: `
    :host ::ng-deep .p-card .black-color {
      color: #111827 !important;
    }
    :host ::ng-deep .custom-lesson-tag.p-tag {
      background: #34d399;
      border: none;
    }
    :host ::ng-deep .custom-lesson-tag .p-tag-value {
      color: #18181b !important;
    }
  `,
})
export class CourseLessonsSectionComponent {
  readonly courseId = input.required<string>();
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly courseProgress = input<CourseProgressResponse | null>(null);

  /** Emitted when lessons list changes (add/edit/delete) */
  readonly lessonsChange = output<LessonWithLectures[]>();
  /** Emitted when teacher wants to add a lecture to a specific lesson */
  readonly addLectureToLesson = output<Lesson>();

  private readonly dataService = inject(CourseDetailsDataService);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly expandedLessons = signal<Set<string>>(new Set());
  readonly markingLecture = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  readonly lessonsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lesson'));

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

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) return;
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
              courseId: this.courseId(),
              title: this.form.controls.title.value,
              content: this.form.controls.content.value,
            }),
          );

      if (editingId) {
        this.lessonsChange.emit(
          this.lessons().map((l) =>
            l.id === editingId ? { ...l, ...createdOrUpdated, lectures: l.lectures ?? [] } : l,
          ),
        );
      } else {
        const next: LessonWithLectures = {
          ...createdOrUpdated,
          kind: createdOrUpdated.kind ?? 'lesson',
          lectures: [],
        };
        this.lessonsChange.emit([next, ...this.lessons()]);
      }
      this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to save lesson');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteLesson(lesson: Lesson): Promise<void> {
    if (!confirm('Удалить урок?')) return;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteLesson(lesson.id));
      this.lessonsChange.emit(this.lessons().filter((l) => l.id !== lesson.id));
      if (this.editingId() === lesson.id) this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete lesson');
    } finally {
      this.submitting.set(false);
    }
  }

  toggleExpanded(lessonId: string): void {
    const s = new Set(this.expandedLessons());
    s.has(lessonId) ? s.delete(lessonId) : s.add(lessonId);
    this.expandedLessons.set(s);
  }

  isExpanded(lessonId: string): boolean {
    return this.expandedLessons().has(lessonId);
  }

  isLectureCompleted(lectureId: string): boolean {
    return this.courseProgress()?.completedLectureIds.includes(lectureId) ?? false;
  }

  getLessonProgress(lessonId: string): { completed: number; total: number } {
    const progress = this.courseProgress();
    if (!progress) return { completed: 0, total: 0 };
    const lesson = this.lessons().find((l) => l.id === lessonId);
    if (!lesson) return { completed: 0, total: 0 };
    const total = lesson.lectures?.length ?? 0;
    const completed =
      lesson.lectures?.filter((lec) => progress.completedLectureIds.includes(lec.id)).length ?? 0;
    return { completed, total };
  }

  getOverallProgress(): number {
    return this.courseProgress()?.progressPercent ?? 0;
  }

  async markLectureCompleted(lectureId: string): Promise<void> {
    if (!this.isStudent() || this.markingLecture()) return;
    const userId = this.authState.getUserId();
    if (!userId) {
      this.error.set('User ID не найден. Пожалуйста, выйдите и войдите заново.');
      return;
    }
    this.markingLecture.set(lectureId);
    try {
      await firstValueFrom(
        this.dataService.markLectureCompleted(this.courseId(), userId, lectureId),
      );
    } catch (e: any) {
      this.error.set(e?.error?.detail ?? e?.message ?? 'Не удалось отметить лекцию');
    } finally {
      this.markingLecture.set(null);
    }
  }
}
