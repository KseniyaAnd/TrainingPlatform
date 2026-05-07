import { Injectable, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Assessment } from '../../../../models/assessment.model';
import { Course } from '../../../../models/course.model';
import { LessonWithLectures } from '../../../../models/lesson-with-lectures.model';
import { CourseProgressResponse } from '../../../../models/progress.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../../models/submission.model';
import { CourseData } from './course-data-loader.service';

/**
 * Сервис для управления состоянием страницы деталей курса
 * Отвечает за: хранение данных курса, UI состояние, форму редактирования
 */
@Injectable()
export class CourseDetailsStateService {
  private readonly fb = inject(FormBuilder);

  // ── Course data ───────────────────────────────────────────────────────────
  readonly course = signal<Course | undefined>(undefined);
  readonly courseLessons = signal<LessonWithLectures[]>([]);
  readonly assessments = signal<Assessment[]>([]);
  readonly studentAssessments = signal<AssessmentStudentResponse[]>([]);
  readonly submissions = signal<SubmissionResponse[]>([]);
  readonly courseProgress = signal<CourseProgressResponse | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  readonly activeTab = signal<'content' | 'analytics'>('content');
  readonly showCourseForm = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isLoaded = computed(() => this.course() !== undefined);
  readonly hasError = computed(() => this.submitError() !== null);
  readonly courseTitle = computed(() => this.course()?.title ?? '');
  readonly courseDescription = computed(() => this.course()?.description ?? '');

  // ── Form ──────────────────────────────────────────────────────────────────
  readonly courseForm: FormGroup = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  // ── Methods ───────────────────────────────────────────────────────────────

  /**
   * Установить все данные курса из CourseData
   */
  setCourseData(data: CourseData): void {
    this.course.set(data.course);
    this.courseLessons.set(data.lessons);

    if (data.assessments) {
      this.assessments.set(data.assessments);
    }
    if (data.studentAssessments) {
      this.studentAssessments.set(data.studentAssessments);
    }
    if (data.submissions) {
      this.submissions.set(data.submissions);
    }
    if (data.progress !== undefined) {
      this.courseProgress.set(data.progress);
    }
  }

  /**
   * Обновить данные курса
   */
  updateCourse(course: Course): void {
    this.course.set(course);
  }

  /**
   * Обновить список уроков
   */
  updateLessons(lessons: LessonWithLectures[]): void {
    this.courseLessons.set(lessons);
  }

  /**
   * Обновить список assessments
   */
  updateAssessments(assessments: Assessment[]): void {
    console.log('🔄 Обновление списка assessments в state:', {
      oldCount: this.assessments().length,
      newCount: assessments.length,
      newAssessments: assessments.map((a) => ({
        id: a.id,
        title: a.title,
        sourceType: a.sourceType,
        sourceId: a.sourceId,
      })),
    });
    this.assessments.set(assessments);
  }

  /**
   * Обновить прогресс курса
   */
  setCourseProgress(progress: CourseProgressResponse | null): void {
    this.courseProgress.set(progress);
  }

  /**
   * Переключить вкладку
   */
  switchTab(tab: 'content' | 'analytics'): void {
    this.activeTab.set(tab);
  }

  /**
   * Открыть форму редактирования курса
   */
  openEditForm(): void {
    const c = this.course();
    if (!c) return;

    this.courseForm.reset({
      title: c.title ?? '',
      description: c.description ?? '',
    });
    this.showCourseForm.set(true);
    this.submitError.set(null);
  }

  /**
   * Закрыть форму редактирования курса
   */
  closeEditForm(): void {
    this.showCourseForm.set(false);
    this.submitError.set(null);
  }

  /**
   * Установить состояние отправки формы
   */
  setSubmitting(value: boolean): void {
    this.submitting.set(value);
  }

  /**
   * Установить ошибку отправки формы
   */
  setSubmitError(error: string | null): void {
    this.submitError.set(error);
  }

  /**
   * Сбросить все состояние
   */
  reset(): void {
    this.course.set(undefined);
    this.courseLessons.set([]);
    this.assessments.set([]);
    this.studentAssessments.set([]);
    this.submissions.set([]);
    this.courseProgress.set(null);
    this.activeTab.set('content');
    this.showCourseForm.set(false);
    this.submitting.set(false);
    this.submitError.set(null);
    this.courseForm.reset();
  }
}
