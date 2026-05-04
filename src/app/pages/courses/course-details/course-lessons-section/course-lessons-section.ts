import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../models/assessment.model';
import { Lecture } from '../../../../models/lecture.model';
import { Lesson } from '../../../../models/lesson.model';
import { CourseProgressResponse } from '../../../../models/progress.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../../models/submission.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { CourseDetailsDataService } from '../course-details-data.service';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';
import { CourseProgressDisplayComponent } from './components/course-progress-display/course-progress-display.component';
import { ErrorDisplayComponent } from './components/error-display/error-display.component';
import { LectureFormComponent } from './components/lecture-form/lecture-form.component';
import { LessonActionsComponent } from './components/lesson-actions/lesson-actions.component';
import { LessonContentComponent } from './components/lesson-content/lesson-content.component';
import { LessonFormComponent } from './components/lesson-form/lesson-form.component';
import { AssessmentFormService } from './services/assessment-form.service';
import { LectureFormService } from './services/lecture-form.service';
import { LessonFormService } from './services/lesson-form.service';
import { LessonUiStateService } from './services/lesson-ui-state.service';

export type LessonWithLectures = Lesson & { lectures: Lecture[] };

@Component({
  selector: 'app-course-lessons-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    CourseProgressDisplayComponent,
    ErrorDisplayComponent,
    LessonActionsComponent,
    LessonFormComponent,
    LessonContentComponent,
    LectureFormComponent,
    AssessmentFormComponent,
  ],
  providers: [LessonFormService, LectureFormService, AssessmentFormService, LessonUiStateService],
  templateUrl: './course-lessons-section.html',
})
export class CourseLessonsSectionComponent {
  readonly courseId = input.required<string>();
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly courseProgress = input<CourseProgressResponse | null>(null);
  readonly editMode = input<boolean>(false);

  // Assessment-related inputs
  readonly assessments = input<Assessment[]>([]);
  readonly studentAssessments = input<AssessmentStudentResponse[]>([]);
  readonly submissions = input<SubmissionResponse[]>([]);

  /** Emitted when lessons list changes (add/edit/delete) */
  readonly lessonsChange = output<LessonWithLectures[]>();
  /** Emitted when assessments change */
  readonly assessmentsChange = output<Assessment[]>();
  /** Emitted when submissions change */
  readonly submissionsChange = output<SubmissionResponse[]>();

  private readonly dataService = inject(CourseDetailsDataService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Inject services
  readonly lessonFormService: LessonFormService = inject(LessonFormService);
  readonly lectureFormService: LectureFormService = inject(LectureFormService);
  readonly assessmentFormService: AssessmentFormService = inject(AssessmentFormService);
  readonly uiStateService: LessonUiStateService = inject(LessonUiStateService);

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');

  readonly markingLecture = signal<string | null>(null);
  readonly submittingAssessmentId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly submissionForm = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly lessonsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lesson'));

  readonly combinedError = computed(() => {
    return (
      this.error() ||
      this.lessonFormService.error() ||
      this.lectureFormService.error() ||
      this.assessmentFormService.error()
    );
  });

  shouldShowLectures(lesson: LessonWithLectures): boolean {
    return (
      ((this.isStudent() && this.uiStateService.isExpanded(lesson.id)) || this.canEditCourse()) &&
      lesson.lectures &&
      lesson.lectures.length > 0
    );
  }

  getLessonProgress(lesson: LessonWithLectures): { completed: number; total: number } {
    const progress = this.courseProgress();
    if (!progress) return { completed: 0, total: 0 };
    const total = lesson.lectures?.length ?? 0;
    const completed =
      lesson.lectures?.filter((lec) => progress.completedLectureIds.includes(lec.id)).length ?? 0;
    return { completed, total };
  }

  isLectureCompleted(lectureId: string): boolean {
    return this.courseProgress()?.completedLectureIds.includes(lectureId) ?? false;
  }

  getAssessmentsForLecture(lectureId: string): AssessmentStudentResponse[] {
    return this.studentAssessments().filter(
      (a) => a.sourceId === lectureId && a.sourceType === 'LECTURE',
    );
  }

  getTeacherAssessmentsForLecture(lectureId: string): Assessment[] {
    return this.assessments();
  }

  getSubmission(assessmentId: string): SubmissionResponse | null {
    return this.submissions().find((s) => s.assessmentId === assessmentId) ?? null;
  }

  // Lesson form methods
  openAdd(): void {
    this.lessonFormService.openAdd();
  }

  openEdit(lesson: Lesson): void {
    this.lessonFormService.openEdit(lesson);
  }

  cancel(): void {
    this.lessonFormService.cancel();
  }

  async submit(): Promise<void> {
    const result = await this.lessonFormService.submit(this.courseId(), this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }

  async deleteLesson(lesson: Lesson): Promise<void> {
    const result = await this.lessonFormService.deleteLesson(lesson.id, this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }

  // Lecture form methods
  openAddLecture(lessonId: string): void {
    this.lectureFormService.openAdd(lessonId);
  }

  cancelLectureForm(): void {
    this.lectureFormService.cancel();
  }

  async submitLecture(): Promise<void> {
    const result = await this.lectureFormService.submit(this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }

  // Progress methods
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

  // Assessment form methods
  openAddAssessment(lectureId: string): void {
    this.assessmentFormService.openAdd(lectureId);
  }

  cancelAssessmentForm(): void {
    this.assessmentFormService.cancel();
  }

  async submitAssessment(): Promise<void> {
    const result = await this.assessmentFormService.submit(this.courseId(), this.assessments());
    if (result) {
      this.assessmentsChange.emit(result);
    }
  }

  async deleteAssessment(a: Assessment): Promise<void> {
    if (!confirm('Удалить assessment?')) return;
    try {
      await firstValueFrom(this.dataService.deleteAssessment(a.id));
      this.assessmentsChange.emit(this.assessments().filter((x) => x.id !== a.id));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete assessment');
    }
  }

  gradeAssessment(a: Assessment): void {
    void this.router.navigate(['/assessments', a.id, 'grade']);
  }

  // Student submission methods
  async submitAnswer(assessment: AssessmentStudentResponse): Promise<void> {
    if (!this.isStudent() || this.submittingAssessmentId()) return;
    this.error.set(null);
    if (this.submissionForm.invalid) {
      this.error.set('Пожалуйста, заполните ответ');
      return;
    }
    this.submittingAssessmentId.set(assessment.id);
    try {
      const sub = await firstValueFrom(
        this.dataService.createSubmission(
          assessment.id,
          this.submissionForm.controls.answerText.value,
        ),
      );
      this.submissionsChange.emit([sub, ...this.submissions()]);
      this.submissionForm.reset();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Не удалось отправить ответ');
    } finally {
      this.submittingAssessmentId.set(null);
    }
  }
}
