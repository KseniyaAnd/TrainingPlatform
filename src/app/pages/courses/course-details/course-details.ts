import { CommonModule, Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../models/assessment.model';
import { Course } from '../../../models/course.model';
import { Lecture } from '../../../models/lecture.model';
import { Lesson } from '../../../models/lesson.model';
import { CourseProgressResponse } from '../../../models/progress.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../models/submission.model';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { CourseAnalyticsComponent } from './course-analytics/course-analytics';
import { CourseDetailsDataService } from './course-details-data.service';
import { CourseHeaderComponent } from './course-header/course-header';
import { CourseLecturesSectionComponent } from './course-lectures-section/course-lectures-section';
import {
  CourseLessonsSectionComponent,
  LessonWithLectures,
} from './course-lessons-section/course-lessons-section';

@Component({
  selector: 'app-course-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    MessageModule,
    CourseHeaderComponent,
    CourseLessonsSectionComponent,
    CourseLecturesSectionComponent,
    CourseAnalyticsComponent,
  ],
  templateUrl: './course-details.html',
})
export class CourseDetailsPage {
  readonly courseId: string;

  private readonly dataService = inject(CourseDetailsDataService);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // ── Global state ──────────────────────────────────────────────────────────
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly subscribed = signal(false);

  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');
  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });

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

  // ── Course edit form ──────────────────────────────────────────────────────
  readonly courseForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  constructor(route: ActivatedRoute) {
    this.courseId = route.snapshot.paramMap.get('courseId') ?? '';
    void this.loadCourse();
  }

  // ── Data loading ──────────────────────────────────────────────────────────
  private async loadCourse(): Promise<void> {
    if (!this.courseId) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      this.course.set(await firstValueFrom(this.dataService.getCourse(this.courseId)));

      if (this.isStudent()) {
        await this.loadStudentData();
      } else {
        await this.loadTeacherData();
      }
    } catch (e: any) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      if (e?.status === 401 || e?.status === 403) {
        await this.router.navigate(['/login'], {
          queryParams: { returnUrl: `/courses/${this.courseId}` },
        });
        return;
      }
      this.error.set(e instanceof Error ? e.message : 'Failed to load course');
      this.course.set(undefined);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadStudentData(): Promise<void> {
    const enrollment = await firstValueFrom(this.dataService.checkEnrollmentStatus(this.courseId));
    this.subscribed.set(enrollment.isEnrolled);

    if (!enrollment.isEnrolled) return;

    const [lessons, studentAssessments, submissions, progress] = await Promise.all([
      firstValueFrom(this.dataService.getLessons(this.courseId)).catch(() => [] as Lesson[]),
      firstValueFrom(this.dataService.getAssessmentsForStudent(this.courseId)).catch(
        () => [] as AssessmentStudentResponse[],
      ),
      firstValueFrom(this.dataService.getMySubmissions()).catch(() => [] as SubmissionResponse[]),
      firstValueFrom(this.dataService.getCourseProgress(this.courseId)).catch(
        () => null as CourseProgressResponse | null,
      ),
    ]);

    this.studentAssessments.set(studentAssessments ?? []);
    this.submissions.set(submissions ?? []);
    this.courseProgress.set(progress);
    this.courseLessons.set(await this.loadLessonsWithLectures(lessons ?? []));
  }

  private async loadTeacherData(): Promise<void> {
    const [lessons, assessments] = await Promise.all([
      firstValueFrom(this.dataService.getLessons(this.courseId)),
      firstValueFrom(this.dataService.getAssessments(this.courseId)),
    ]);
    console.log('📚 Загружены ассесменты для учителя:', {
      courseId: this.courseId,
      assessmentsCount: assessments?.length ?? 0,
      assessments:
        assessments?.map((a) => ({
          id: a.id,
          title: a.title,
          lectureId: a.lectureId,
          lessonId: a.lessonId,
          sourceType: a.sourceType,
          sourceId: a.sourceId,
        })) ?? [],
    });
    this.assessments.set(assessments ?? []);
    this.courseLessons.set(await this.loadLessonsWithLectures(lessons ?? []));
  }

  private async loadLessonsWithLectures(lessons: Lesson[]): Promise<LessonWithLectures[]> {
    return Promise.all(
      lessons.map(async (lesson) => {
        const lectures = await firstValueFrom(this.dataService.getLectures(lesson.id)).catch(
          () => [] as Lecture[],
        );
        return { ...lesson, kind: lesson.kind ?? 'lesson', lectures: lectures ?? [] };
      }),
    );
  }

  // ── Enrollment ────────────────────────────────────────────────────────────
  async toggleSubscribe(): Promise<void> {
    if (!this.isStudent() || this.subscribed() || this.submitting()) return;

    this.submitting.set(true);
    this.submitError.set(null);
    try {
      await firstValueFrom(this.dataService.enroll(this.courseId));
      this.subscribed.set(true);
      await this.loadCourse();
    } catch (e: any) {
      if (e?.status === 409) {
        this.subscribed.set(true);
        await this.loadCourse();
      } else {
        this.submitError.set(e instanceof Error ? e.message : 'Failed to enroll');
      }
    } finally {
      this.submitting.set(false);
    }
  }

  // ── Course edit ───────────────────────────────────────────────────────────
  openEditCourse(): void {
    const c = this.course();
    if (!c) return;
    this.courseForm.reset({ title: c.title ?? '', description: c.description ?? '' });
    this.showCourseForm.set(true);
  }

  cancelCourseForm(): void {
    this.showCourseForm.set(false);
  }

  async submitCourse(): Promise<void> {
    if (this.courseForm.invalid || this.submitting()) return;
    this.submitError.set(null);
    try {
      this.submitting.set(true);
      const updated = await firstValueFrom(
        this.dataService.updateCourse(this.courseId, {
          title: this.courseForm.controls.title.value,
          description: this.courseForm.controls.description.value,
        }),
      );
      this.course.set(updated);
      this.showCourseForm.set(false);
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to update course');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteCourse(): Promise<void> {
    if (!confirm('Удалить курс?')) return;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteCourse(this.courseId));
      await this.router.navigateByUrl('/courses');
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to delete course');
    } finally {
      this.submitting.set(false);
    }
  }

  // ── Tab ───────────────────────────────────────────────────────────────────
  switchTab(tab: 'content' | 'analytics'): void {
    this.activeTab.set(tab);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goBack(): void {
    this.location.back();
  }

  // ── Assessment handlers ───────────────────────────────────────────────────
  onAssessmentsChange(newAssessments: Assessment[]): void {
    console.log('🔄 Обновление списка ассесментов:', {
      oldCount: this.assessments().length,
      newCount: newAssessments.length,
      newAssessments: newAssessments.map((a) => ({
        id: a.id,
        title: a.title,
        lectureId: a.lectureId,
        lessonId: a.lessonId,
        sourceType: a.sourceType,
        sourceId: a.sourceId,
      })),
    });
    this.assessments.set(newAssessments);
  }
}
