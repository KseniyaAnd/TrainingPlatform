import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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
import { LessonContentComponent } from './components/lesson-content/lesson-content.component';
import { LessonFormComponent } from './components/lesson-form/lesson-form.component';
import { AssessmentFormService } from './services/assessment-form.service';
import { LectureFormService } from './services/lecture-form.service';
import { LectureSectionFormService } from './services/lecture-section-form.service';
import { LessonFormService } from './services/lesson-form.service';
import { LessonUiStateService } from './services/lesson-ui-state.service';

export type LessonWithLectures = Lesson & { lectures: Lecture[] };

@Component({
  selector: 'app-course-lessons-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CourseProgressDisplayComponent,
    ErrorDisplayComponent,
    LessonFormComponent,
    LessonContentComponent,
    LectureFormComponent,
    AssessmentFormComponent,
  ],
  providers: [
    LessonFormService,
    LectureFormService,
    LectureSectionFormService,
    AssessmentFormService,
    LessonUiStateService,
  ],
  templateUrl: './course-lessons-section.html',
})
export class CourseLessonsSectionComponent {
  readonly courseId = input.required<string>();
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly courseProgress = input<CourseProgressResponse | null>(null);
  readonly courseLevelEditMode = input<boolean>(false); // Режим редактирования уровня курса (только создание/удаление уроков)

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
  readonly lectureSectionFormService: LectureSectionFormService = inject(LectureSectionFormService);
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
  readonly lessonEditMode = signal<string | null>(null); // ID урока в режиме редактирования
  readonly sectionEditMode = signal<string | null>(null); // ID отдела лекций в режиме редактирования
  readonly lectureEditMode = signal<string | null>(null); // ID лекции в режиме редактирования

  readonly submissionForm = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly lessonsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lesson'));
  readonly lectureSectionsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lecture'));

  readonly combinedError = computed(() => {
    return (
      this.error() ||
      this.lessonFormService.error() ||
      this.lectureFormService.error() ||
      this.assessmentFormService.error()
    );
  });

  constructor() {
    // Закрываем режим редактирования урока при выходе из режима редактирования курса
    const authState = inject(AuthStateService);
    effect(() => {
      if (!this.courseLevelEditMode()) {
        this.lessonEditMode.set(null);
        this.lessonFormService.cancel();
      }
    });
  }

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

  toggleLessonEditMode(lessonId: string): void {
    if (this.lessonEditMode() === lessonId) {
      this.lessonEditMode.set(null);
      this.lessonFormService.cancel();
    } else {
      this.lessonEditMode.set(lessonId);
      const lesson = this.lessons().find((l) => l.id === lessonId);
      if (lesson) {
        this.lessonFormService.openEdit(lesson);
      }
    }
  }

  isLessonInEditMode(lessonId: string): boolean {
    return this.lessonEditMode() === lessonId;
  }

  cancel(): void {
    this.lessonFormService.cancel();
    this.lessonEditMode.set(null); // Выходим из режима редактирования при отмене
  }

  async submit(): Promise<void> {
    const result = await this.lessonFormService.submit(this.courseId(), this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
      this.lessonEditMode.set(null); // Выходим из режима редактирования после сохранения
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

  toggleLectureEditMode(lectureId: string): void {
    if (this.lectureEditMode() === lectureId) {
      this.lectureEditMode.set(null);
      this.lectureFormService.cancel();
    } else {
      // Закрываем форму добавления лекции, если она открыта
      if (this.lectureFormService.showForm() && !this.lectureFormService.editingId()) {
        this.lectureFormService.cancel();
      }

      this.lectureEditMode.set(lectureId);
      // Найти лекцию и открыть форму редактирования
      for (const lesson of this.lessons()) {
        const lecture = lesson.lectures?.find((l) => l.id === lectureId);
        if (lecture) {
          this.lectureFormService.openEdit(lecture, lesson.id);
          break;
        }
      }
    }
  }

  isLectureInEditMode(lectureId: string): boolean {
    return this.lectureEditMode() === lectureId;
  }

  cancelLectureEdit(): void {
    this.lectureFormService.cancel();
    this.lectureEditMode.set(null);
  }

  async submitLectureEdit(): Promise<void> {
    const result = await this.lectureFormService.submit(this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
      this.lectureEditMode.set(null);
    }
  }

  async deleteLecture(lectureId: string, lessonId: string): Promise<void> {
    if (!confirm('Удалить лекцию?')) return;
    try {
      await firstValueFrom(this.dataService.deleteLecture(lectureId));
      const updated = this.lessons().map((lesson) => {
        if (lesson.id === lessonId) {
          return {
            ...lesson,
            lectures: lesson.lectures.filter((lec) => lec.id !== lectureId),
          };
        }
        return lesson;
      });
      this.lessonsChange.emit(updated);
      if (this.lectureEditMode() === lectureId) {
        this.lectureEditMode.set(null);
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete lecture');
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

  openEditAssessment(assessment: Assessment): void {
    this.assessmentFormService.openEdit(assessment);
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

  async deleteAssessmentFromForm(): Promise<void> {
    const assessmentId = this.assessmentFormService.editingId();
    if (!assessmentId) return;

    try {
      await firstValueFrom(this.dataService.deleteAssessment(assessmentId));
      this.assessmentsChange.emit(this.assessments().filter((x) => x.id !== assessmentId));
      this.assessmentFormService.cancel();
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

  // Lecture Section methods
  openAddLectureSection(): void {
    this.lectureSectionFormService.openAdd();
  }

  openEditLectureSection(section: Lesson): void {
    this.lectureSectionFormService.openEdit(section);
    this.sectionEditMode.set(section.id);
  }

  toggleSectionEditMode(sectionId: string): void {
    if (this.sectionEditMode() === sectionId) {
      this.sectionEditMode.set(null);
      this.lectureSectionFormService.cancel();
    } else {
      this.sectionEditMode.set(sectionId);
      const section = this.lessons().find((l) => l.id === sectionId);
      if (section) {
        this.lectureSectionFormService.openEdit(section);
      }
    }
  }

  isSectionInEditMode(sectionId: string): boolean {
    return this.sectionEditMode() === sectionId;
  }

  cancelSectionEdit(): void {
    this.lectureSectionFormService.cancel();
    this.sectionEditMode.set(null);
  }

  async submitLectureSection(): Promise<void> {
    const result = await this.lectureSectionFormService.submit(this.courseId(), this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
      this.sectionEditMode.set(null);
    }
  }

  async deleteLectureSection(section: Lesson): Promise<void> {
    const result = await this.lectureSectionFormService.deleteSection(section.id, this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }
}
