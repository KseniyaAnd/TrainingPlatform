import { CommonModule } from '@angular/common';
import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { firstValueFrom, map } from 'rxjs';
import { Assessment } from '../../../models/assessment.model';
import { Course } from '../../../models/course.model';
import { Lecture } from '../../../models/lecture.model';
import { Lesson } from '../../../models/lesson.model';
import { CourseProgressResponse } from '../../../models/progress.model';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import {
  AssessmentDifficulty,
  AssessmentDraftResponse,
  AssessmentDraftSourceType,
  CourseContentService,
  CreateAssessmentFromDraftRequest,
  CreateAssessmentRequest,
  CreateLectureRequest,
  CreateLessonRequest,
  GenerateAssessmentDraftRequest,
  UpdateAssessmentRequest,
  UpdateLectureRequest,
  UpdateLessonRequest,
} from '../../../services/courses/course-content.service';
import { CoursesService, UpdateCourseRequest } from '../../../services/courses/courses.service';
import { ProgressService } from '../../../services/progress/progress.service';

@Injectable({ providedIn: 'root' })
class CourseDetailsDataService {
  private readonly coursesService = inject(CoursesService);
  private readonly courseContent = inject(CourseContentService);
  private readonly progressService = inject(ProgressService);

  getCourse(courseId: string) {
    return this.coursesService.getCourseById(courseId);
  }

  updateCourse(courseId: string, payload: UpdateCourseRequest) {
    return this.coursesService.updateCourse(courseId, payload);
  }

  deleteCourse(courseId: string) {
    return this.coursesService.deleteCourse(courseId);
  }

  getLessons(courseId: string) {
    return this.courseContent.getLessonsByCourseId(courseId);
  }

  getLectures(lessonId: string) {
    return this.courseContent.getLecturesByLessonId(lessonId);
  }

  getAssessments(courseId: string) {
    return this.courseContent.getAssessmentsByCourseId(courseId);
  }

  getCourseProgress(courseId: string) {
    return this.progressService.getCourseProgress(courseId);
  }

  markLectureCompleted(courseId: string, userId: string, lectureId: string) {
    return this.progressService.markLectureCompleted(courseId, userId, lectureId);
  }

  createLesson(payload: CreateLessonRequest) {
    return this.courseContent.createLesson(payload);
  }

  updateLesson(lessonId: string, payload: UpdateLessonRequest) {
    return this.courseContent.updateLesson(lessonId, payload);
  }

  deleteLesson(lessonId: string) {
    return this.courseContent.deleteLesson(lessonId);
  }

  createLecture(payload: CreateLectureRequest) {
    return this.courseContent.createLecture(payload);
  }

  updateLecture(lectureId: string, payload: UpdateLectureRequest) {
    return this.courseContent.updateLecture(lectureId, payload);
  }

  deleteLecture(lectureId: string) {
    return this.courseContent.deleteLecture(lectureId);
  }

  createAssessment(payload: CreateAssessmentRequest) {
    return this.courseContent.createAssessment(payload);
  }

  updateAssessment(assessmentId: string, payload: UpdateAssessmentRequest) {
    return this.courseContent.updateAssessment(assessmentId, payload);
  }

  deleteAssessment(assessmentId: string) {
    return this.courseContent.deleteAssessment(assessmentId);
  }

  generateAssessmentDraft(payload: GenerateAssessmentDraftRequest) {
    return this.courseContent.generateAssessmentDraft(payload);
  }

  createAssessmentFromDraft(payload: CreateAssessmentFromDraftRequest) {
    return this.courseContent.createAssessmentFromDraft(payload);
  }

  enroll(courseId: string) {
    return this.coursesService.enroll(courseId);
  }

  getEnrolledCourses() {
    return this.coursesService.getEnrolledCourses({ limit: 200 });
  }

  checkEnrollmentStatus(courseId: string) {
    return this.coursesService.getEnrolledCourses({ limit: 200 }).pipe(
      map((response) => {
        const enrollment = response.items.find((e) => e.course.id === courseId);
        return enrollment
          ? { isEnrolled: true, enrollmentId: enrollment.enrollmentId }
          : { isEnrolled: false, enrollmentId: null };
      }),
    );
  }
}

@Component({
  selector: 'app-course-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    MessageModule,
  ],
  templateUrl: './course-details.html',
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

    :host ::ng-deep .p-card-body {
      display: none;
    }
  `,
})
export class CourseDetailsPage {
  readonly courseId: string;
  subscribed = false;

  private readonly dataService = inject(CourseDetailsDataService);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly isTeacher = computed(() => this.authState.role() === 'TEACHER');
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');
  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });

  // Progress tracking for students
  readonly courseProgress = signal<CourseProgressResponse | null>(null);
  readonly expandedLessons = signal<Set<string>>(new Set());
  readonly markingLecture = signal<string | null>(null);

  readonly showLessonForm = signal(false);
  readonly showLectureForm = signal(false);
  readonly showAssessmentForm = signal(false);
  readonly showCourseForm = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly editingLessonId = signal<string | null>(null);
  readonly editingLectureId = signal<string | null>(null);
  readonly editingAssessmentId = signal<string | null>(null);

  readonly useAiForAssessment = signal(false);

  readonly isAssessmentDraftMode = signal(false);
  readonly assessmentDraft = signal<AssessmentDraftResponse | null>(null);
  readonly draftSourceType = signal<AssessmentDraftSourceType>('LESSON');
  readonly draftSourceId = signal<string>('');
  readonly generatingDraft = signal(false);

  readonly course = signal<Course | undefined>(undefined);
  readonly courseLessons = signal<Array<Lesson & { lectures: Lecture[] }>>([]);
  readonly assessments = signal<Assessment[]>([]);

  readonly lessonsOnly = computed(() => this.courseLessons().filter((l) => l.kind === 'lesson'));

  readonly lessonForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(1)]],
  });

  readonly courseForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  readonly lectureForm = this.fb.nonNullable.group({
    lessonId: ['', [Validators.required]],
    title: ['', [Validators.required, Validators.minLength(3)]],
    videoUrl: [''],
    content: [''],
  });

  readonly allLectures = computed(() => this.courseLessons().flatMap((l) => l.lectures ?? []));

  readonly assessmentForm = this.fb.nonNullable.group({
    lessonId: ['', [Validators.required]],
    lectureId: [''],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    questionsText: ['', [Validators.required]],
    answerKeyText: ['', [Validators.required]],
    rubricCriteriaText: ['', [Validators.required]],
  });

  readonly assessmentAiForm = this.fb.nonNullable.group({
    sourceType: ['LESSON' as AssessmentDraftSourceType, [Validators.required]],
    sourceId: ['', [Validators.required]],
    questionCount: [5, [Validators.required]],
    difficulty: ['MEDIUM' as AssessmentDifficulty, [Validators.required]],
  });

  constructor(route: ActivatedRoute) {
    this.courseId = route.snapshot.paramMap.get('courseId') ?? '';

    void this.loadCourse();
  }

  private async loadCourse(): Promise<void> {
    if (!this.courseId) {
      this.course.set(undefined);
      this.courseLessons.set([]);
      this.assessments.set([]);
      this.courseProgress.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.submitError.set(null);

    try {
      this.course.set(await firstValueFrom(this.dataService.getCourse(this.courseId)));

      const promises: Promise<unknown>[] = [
        firstValueFrom(this.dataService.getLessons(this.courseId)),
        firstValueFrom(this.dataService.getAssessments(this.courseId)),
      ];

      // Check enrollment status and load progress for students
      if (this.isStudent()) {
        promises.push(firstValueFrom(this.dataService.checkEnrollmentStatus(this.courseId)));
        promises.push(
          firstValueFrom(this.dataService.getCourseProgress(this.courseId)).catch(() => null),
        );
      }

      const results = await Promise.all(promises);
      const lessons = results[0] as Lesson[];
      const assessments = results[1] as Assessment[];

      this.assessments.set(assessments ?? []);

      // Check if student is enrolled and load progress
      if (this.isStudent() && results.length > 2) {
        const enrollmentStatus = results[2] as { isEnrolled: boolean; enrollmentId: string | null };
        this.subscribed = enrollmentStatus.isEnrolled;

        if (results.length > 3) {
          const progress = results[3] as CourseProgressResponse | null;
          this.courseProgress.set(progress);
        }
      }

      const lessonsWithLectures = await Promise.all(
        (lessons ?? []).map(async (lesson) => {
          const lectures = await firstValueFrom(this.dataService.getLectures(lesson.id));
          return {
            ...lesson,
            kind: lesson.kind ?? 'lesson',
            lectures: lectures ?? [],
          };
        }),
      );

      this.courseLessons.set(lessonsWithLectures);
    } catch (e) {
      this.course.set(undefined);
      this.courseLessons.set([]);
      this.assessments.set([]);
      this.courseProgress.set(null);
      this.error.set(e instanceof Error ? e.message : 'Failed to load course');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleSubscribe(): Promise<void> {
    if (!this.isStudent() || this.subscribed || this.submitting()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    try {
      await firstValueFrom(this.dataService.enroll(this.courseId));
      this.subscribed = true;
    } catch (e) {
      // If already enrolled (409 Conflict), just mark as subscribed
      if (e && typeof e === 'object' && 'status' in e && e.status === 409) {
        this.subscribed = true;
      } else {
        this.submitError.set(e instanceof Error ? e.message : 'Failed to enroll');
      }
    } finally {
      this.submitting.set(false);
    }
  }

  addLesson(): void {
    if (!this.canEditCourse()) return;
    this.showLessonForm.set(true);
    this.showLectureForm.set(false);
    this.showAssessmentForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);
    this.editingLessonId.set(null);
    this.lessonForm.reset({ title: '', content: '' });
  }

  editCourse(): void {
    if (!this.canEditCourse()) return;
    const c = this.course();
    if (!c) return;

    this.showCourseForm.set(true);
    this.showLessonForm.set(false);
    this.showLectureForm.set(false);
    this.showAssessmentForm.set(false);
    this.submitError.set(null);

    this.courseForm.reset({
      title: c.title ?? '',
      description: c.description ?? '',
    });
  }

  async submitCourse(): Promise<void> {
    if (!this.canEditCourse()) return;
    this.submitError.set(null);
    if (this.courseForm.invalid) return;
    if (this.submitting()) return;
    if (!this.courseId) return;

    try {
      this.submitting.set(true);
      const updated = await firstValueFrom(
        this.dataService.updateCourse(this.courseId, {
          title: this.courseForm.controls.title.value,
          description: this.courseForm.controls.description.value,
        }),
      );
      this.course.set(updated);
      this.cancelForms();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to update course');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteCourse(): Promise<void> {
    if (!this.canEditCourse()) return;
    if (!this.courseId) return;
    const ok = confirm('Удалить курс?');
    if (!ok) return;

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

  addLecture(lesson: Lesson): void {
    if (!this.canEditCourse()) return;
    this.showLectureForm.set(true);
    this.showLessonForm.set(false);
    this.showAssessmentForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);
    this.editingLectureId.set(null);
    this.lectureForm.reset({ lessonId: lesson.id, title: '', videoUrl: '', content: '' });
  }

  addLectureFromSection(): void {
    if (!this.canEditCourse()) return;
    const firstLessonId = this.lessonsOnly()[0]?.id;
    if (!firstLessonId) {
      this.submitError.set('Сначала добавьте урок');
      return;
    }

    this.showLectureForm.set(true);
    this.showLessonForm.set(false);
    this.showAssessmentForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);
    this.editingLectureId.set(null);
    this.lectureForm.reset({ lessonId: firstLessonId, title: '', videoUrl: '', content: '' });
  }

  cancelForms(): void {
    this.showLessonForm.set(false);
    this.showLectureForm.set(false);
    this.showAssessmentForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);

    this.editingLessonId.set(null);
    this.editingLectureId.set(null);
    this.editingAssessmentId.set(null);

    this.useAiForAssessment.set(false);

    this.isAssessmentDraftMode.set(false);
    this.assessmentDraft.set(null);
    this.draftSourceType.set('LESSON');
    this.draftSourceId.set('');
  }

  setUseAiForAssessment(next: boolean): void {
    this.useAiForAssessment.set(next);
    if (!next) {
      this.isAssessmentDraftMode.set(false);
      this.assessmentDraft.set(null);
      this.draftSourceType.set('LESSON');
      this.draftSourceId.set('');
    }
  }

  addAssessment(): void {
    if (!this.canEditCourse()) return;
    const lessonId = this.lessonsOnly()[0]?.id;
    const lectureId = this.courseLessons().find((l) => l.id === lessonId)?.lectures?.[0]?.id;

    if (!lessonId) {
      this.submitError.set('Add a lesson first');
      return;
    }

    this.showAssessmentForm.set(true);
    this.showLessonForm.set(false);
    this.showLectureForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);

    this.editingAssessmentId.set(null);

    this.useAiForAssessment.set(false);
    this.isAssessmentDraftMode.set(false);
    this.assessmentDraft.set(null);

    this.assessmentForm.reset({
      lessonId,
      lectureId: lectureId ?? '',
      title: '',
      description: '',
      questionsText: '',
      answerKeyText: '',
      rubricCriteriaText: '',
    });

    this.assessmentAiForm.reset({
      sourceType: 'LESSON',
      sourceId: lessonId,
      questionCount: 5,
      difficulty: 'MEDIUM',
    });

    this.draftSourceType.set('LESSON');
    this.draftSourceId.set(lessonId);
  }

  onAssessmentLessonChange(): void {
    const selectedLessonId = this.assessmentForm.controls.lessonId.value;
    const lecturesForLesson =
      this.courseLessons().find((l) => l.id === selectedLessonId)?.lectures ?? [];
    const currentLectureId = this.assessmentForm.controls.lectureId.value;
    const lectureStillValid = lecturesForLesson.some((l) => l.id === currentLectureId);

    if (!lectureStillValid) {
      this.assessmentForm.controls.lectureId.setValue(lecturesForLesson[0]?.id ?? '');
    }

    if (this.assessmentAiForm.controls.sourceType.value === 'LESSON') {
      this.assessmentAiForm.controls.sourceId.setValue(selectedLessonId ?? '');
      this.draftSourceId.set(selectedLessonId ?? '');
    }
  }

  onAssessmentAiSourceTypeChange(): void {
    const sourceType = this.assessmentAiForm.controls.sourceType.value;
    if (sourceType === 'LESSON') {
      const lessonId = this.assessmentForm.controls.lessonId.value;
      this.assessmentAiForm.controls.sourceId.setValue(lessonId ?? '');
      this.draftSourceType.set('LESSON');
      this.draftSourceId.set(lessonId ?? '');
      return;
    }

    const lectureId = this.assessmentForm.controls.lectureId.value;
    this.assessmentAiForm.controls.sourceId.setValue(lectureId ?? '');
    this.draftSourceType.set('LECTURE');
    this.draftSourceId.set(lectureId ?? '');
  }

  private joinLines(items: string[]): string {
    return (items ?? []).join('\n');
  }

  assessmentAiSources(): Array<{ id: string; title: string }> {
    const type = this.assessmentAiForm.controls.sourceType.value;
    if (type === 'LECTURE') {
      return this.allLectures().map((l) => ({ id: l.id, title: l.title }));
    }

    return this.lessonsOnly().map((l) => ({ id: l.id, title: l.title }));
  }

  async generateAssessmentDraft(): Promise<void> {
    if (!this.canEditCourse()) return;
    this.submitError.set(null);
    if (this.assessmentAiForm.invalid) return;
    if (this.generatingDraft()) return;

    const sourceType = this.assessmentAiForm.controls.sourceType.value;
    const sourceId = this.assessmentAiForm.controls.sourceId.value;
    const questionCount = Number(this.assessmentAiForm.controls.questionCount.value);
    const difficulty = this.assessmentAiForm.controls.difficulty.value;

    if (!sourceId) return;

    try {
      this.generatingDraft.set(true);
      const draft = await firstValueFrom(
        this.dataService.generateAssessmentDraft({
          courseId: this.courseId,
          sourceType,
          sourceId,
          questionCount,
          difficulty,
        }),
      );

      this.assessmentDraft.set(draft);
      this.isAssessmentDraftMode.set(true);
      this.draftSourceType.set(sourceType);
      this.draftSourceId.set(sourceId);

      this.assessmentForm.patchValue({
        title: draft.title ?? '',
        description: draft.description ?? '',
        questionsText: this.joinLines(draft.questions ?? []),
        answerKeyText: this.joinLines(draft.answerKey ?? []),
        rubricCriteriaText: this.joinLines(draft.rubricCriteria ?? []),
      });
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to generate assessment draft');
    } finally {
      this.generatingDraft.set(false);
    }
  }

  private parseLines(raw: string): string[] {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  lecturesForAssessmentLesson(): Lecture[] {
    const selectedLessonId = this.assessmentForm.controls.lessonId.value;
    return this.courseLessons().find((l) => l.id === selectedLessonId)?.lectures ?? [];
  }

  async submitAssessment(): Promise<void> {
    if (!this.canEditCourse()) return;
    this.submitError.set(null);
    if (this.assessmentForm.invalid) return;
    if (this.submitting()) return;

    const questions = this.parseLines(this.assessmentForm.controls.questionsText.value);
    const answerKey = this.parseLines(this.assessmentForm.controls.answerKeyText.value);
    const rubricCriteria = this.parseLines(this.assessmentForm.controls.rubricCriteriaText.value);

    if (questions.length === 0 || answerKey.length === 0 || rubricCriteria.length === 0) {
      this.submitError.set('Questions, answer key, and rubric criteria are required');
      return;
    }

    const lessonId = this.assessmentForm.controls.lessonId.value;
    const lectureId = this.assessmentForm.controls.lectureId.value;

    if (!lessonId) {
      this.submitError.set('Lesson is required');
      return;
    }

    try {
      this.submitting.set(true);
      const editingAssessmentId = this.editingAssessmentId();

      const createdOrUpdated = editingAssessmentId
        ? await firstValueFrom(
            this.dataService.updateAssessment(editingAssessmentId, {
              title: this.assessmentForm.controls.title.value,
              description: this.assessmentForm.controls.description.value,
              questions,
              answerKey,
              rubricCriteria,
            }),
          )
        : this.useAiForAssessment() && this.isAssessmentDraftMode()
          ? await firstValueFrom(
              this.dataService.createAssessmentFromDraft({
                courseId: this.courseId,
                sourceType: this.draftSourceType(),
                sourceId: this.draftSourceId(),
                title: this.assessmentForm.controls.title.value,
                description: this.assessmentForm.controls.description.value,
                questions,
                answerKey,
                rubricCriteria,
              }),
            )
          : await firstValueFrom(
              this.dataService.createAssessment({
                courseId: this.courseId,
                ...(lectureId ? { lectureId } : { lessonId }),
                title: this.assessmentForm.controls.title.value,
                description: this.assessmentForm.controls.description.value,
                questions,
                answerKey,
                rubricCriteria,
              }),
            );

      if (editingAssessmentId) {
        this.assessments.set(
          this.assessments().map((a) => (a.id === editingAssessmentId ? createdOrUpdated : a)),
        );
      } else {
        this.assessments.set([createdOrUpdated, ...this.assessments()]);
      }
      this.cancelForms();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to create assessment');
    } finally {
      this.submitting.set(false);
    }
  }

  editAssessment(a: Assessment): void {
    if (!this.canEditCourse()) return;
    this.showAssessmentForm.set(true);
    this.showLessonForm.set(false);
    this.showLectureForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);

    this.editingAssessmentId.set(a.id);
    this.useAiForAssessment.set(false);
    this.isAssessmentDraftMode.set(false);
    this.assessmentDraft.set(null);

    this.assessmentForm.reset({
      lessonId: a.lessonId ?? this.lessonsOnly()[0]?.id ?? '',
      lectureId: a.lectureId ?? '',
      title: a.title ?? '',
      description: a.description ?? '',
      questionsText: this.joinLines(a.questions ?? []),
      answerKeyText: this.joinLines(a.answerKey ?? []),
      rubricCriteriaText: this.joinLines(a.rubricCriteria ?? []),
    });
  }

  async deleteAssessment(a: Assessment): Promise<void> {
    if (!this.canEditCourse()) return;
    const ok = confirm('Удалить assessment?');
    if (!ok) return;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteAssessment(a.id));
      this.assessments.set(this.assessments().filter((x) => x.id !== a.id));
      if (this.editingAssessmentId() === a.id) this.cancelForms();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to delete assessment');
    } finally {
      this.submitting.set(false);
    }
  }

  async submitLesson(): Promise<void> {
    if (!this.canEditCourse()) return;
    this.submitError.set(null);
    if (this.lessonForm.invalid) return;
    if (this.submitting()) return;

    try {
      this.submitting.set(true);
      const editingLessonId = this.editingLessonId();
      const createdOrUpdated = editingLessonId
        ? await firstValueFrom(
            this.dataService.updateLesson(editingLessonId, {
              title: this.lessonForm.controls.title.value,
              content: this.lessonForm.controls.content.value,
            }),
          )
        : await firstValueFrom(
            this.dataService.createLesson({
              courseId: this.courseId,
              title: this.lessonForm.controls.title.value,
              content: this.lessonForm.controls.content.value,
            }),
          );

      if (editingLessonId) {
        this.courseLessons.set(
          this.courseLessons().map((l) =>
            l.id === editingLessonId
              ? { ...l, ...createdOrUpdated, lectures: l.lectures ?? [] }
              : l,
          ),
        );
      } else {
        const nextLesson: Lesson & { lectures: Lecture[] } = {
          ...createdOrUpdated,
          kind: createdOrUpdated.kind ?? 'lesson',
          lectures: [],
        };
        this.courseLessons.set([nextLesson, ...this.courseLessons()]);
      }
      this.cancelForms();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to create lesson');
    } finally {
      this.submitting.set(false);
    }
  }

  editLesson(lesson: Lesson): void {
    if (!this.canEditCourse()) return;
    this.showLessonForm.set(true);
    this.showLectureForm.set(false);
    this.showAssessmentForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);
    this.editingLessonId.set(lesson.id);
    this.lessonForm.reset({ title: lesson.title ?? '', content: lesson.content ?? '' });
  }

  async deleteLesson(lesson: Lesson): Promise<void> {
    if (!this.canEditCourse()) return;
    const ok = confirm('Удалить урок?');
    if (!ok) return;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteLesson(lesson.id));
      this.courseLessons.set(this.courseLessons().filter((l) => l.id !== lesson.id));
      if (this.editingLessonId() === lesson.id) this.cancelForms();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to delete lesson');
    } finally {
      this.submitting.set(false);
    }
  }

  async submitLecture(): Promise<void> {
    if (!this.canEditCourse()) return;
    this.submitError.set(null);
    if (this.lectureForm.invalid) return;
    if (this.submitting()) return;

    const lessonId = this.lectureForm.controls.lessonId.value;

    const videoUrl = this.lectureForm.controls.videoUrl.value.trim();
    const content = this.lectureForm.controls.content.value.trim();
    const hasVideo = Boolean(videoUrl);
    const hasContent = Boolean(content);

    if ((hasVideo && hasContent) || (!hasVideo && !hasContent)) {
      this.submitError.set('Укажите либо видео, либо текст');
      return;
    }

    try {
      this.submitting.set(true);
      const editingLectureId = this.editingLectureId();
      const createdOrUpdated = editingLectureId
        ? await firstValueFrom(
            this.dataService.updateLecture(editingLectureId, {
              title: this.lectureForm.controls.title.value,
              videoUrl: hasVideo ? videoUrl : null,
              content: hasContent ? content : null,
            }),
          )
        : await firstValueFrom(
            this.dataService.createLecture({
              lessonId,
              title: this.lectureForm.controls.title.value,
              videoUrl: hasVideo ? videoUrl : null,
              content: hasContent ? content : null,
            }),
          );

      this.courseLessons.set(
        this.courseLessons().map((l) =>
          l.id === lessonId
            ? {
                ...l,
                lectures: editingLectureId
                  ? (l.lectures ?? []).map((x) =>
                      x.id === editingLectureId ? createdOrUpdated : x,
                    )
                  : [createdOrUpdated, ...(l.lectures ?? [])],
              }
            : l,
        ),
      );
      this.cancelForms();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to create lecture');
    } finally {
      this.submitting.set(false);
    }
  }

  editLecture(lecture: Lecture): void {
    if (!this.canEditCourse()) return;
    this.showLectureForm.set(true);
    this.showLessonForm.set(false);
    this.showAssessmentForm.set(false);
    this.showCourseForm.set(false);
    this.submitError.set(null);
    this.editingLectureId.set(lecture.id);
    this.lectureForm.reset({
      lessonId: lecture.lessonId,
      title: lecture.title ?? '',
      videoUrl: lecture.videoUrl ?? '',
      content: lecture.content ?? '',
    });
  }

  async deleteLecture(lecture: Lecture): Promise<void> {
    if (!this.canEditCourse()) return;
    const ok = confirm('Удалить лекцию?');
    if (!ok) return;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteLecture(lecture.id));
      this.courseLessons.set(
        this.courseLessons().map((l) =>
          l.id === lecture.lessonId
            ? { ...l, lectures: (l.lectures ?? []).filter((x) => x.id !== lecture.id) }
            : l,
        ),
      );
      if (this.editingLectureId() === lecture.id) this.cancelForms();
    } catch (e) {
      this.submitError.set(e instanceof Error ? e.message : 'Failed to delete lecture');
    } finally {
      this.submitting.set(false);
    }
  }

  // Progress tracking methods
  toggleLessonExpanded(lessonId: string): void {
    const expanded = this.expandedLessons();
    const newExpanded = new Set(expanded);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    this.expandedLessons.set(newExpanded);
  }

  isLessonExpanded(lessonId: string): boolean {
    return this.expandedLessons().has(lessonId);
  }

  isLectureCompleted(lectureId: string): boolean {
    const progress = this.courseProgress();
    if (!progress) return false;
    return progress.completedLectureIds.includes(lectureId);
  }

  async markLectureAsCompleted(lectureId: string): Promise<void> {
    if (!this.isStudent() || this.markingLecture()) return;

    // Check if enrolled first
    if (!this.subscribed) {
      this.submitError.set('Вы должны быть записаны на курс. Нажмите "Подписаться" сначала.');
      return;
    }

    // Get userId from auth state (internal DB ID, not Keycloak sub)
    const userId = this.authState.getUserId();
    if (!userId) {
      this.submitError.set('User ID не найден. Пожалуйста, выйдите и войдите заново.');
      console.error('Internal userId is missing. User needs to re-login.');
      return;
    }

    console.log('Marking lecture as completed:', {
      courseId: this.courseId,
      userId,
      lectureId,
    });

    this.markingLecture.set(lectureId);
    try {
      const progress = await firstValueFrom(
        this.dataService.markLectureCompleted(this.courseId, userId, lectureId),
      );

      // Update progress with the response
      this.courseProgress.set(progress);
      console.log('Lecture marked as completed successfully');
    } catch (e: any) {
      console.error('Failed to mark lecture as completed:', e);

      // Extract more detailed error information
      let errorMessage = 'Не удалось отметить лекцию как просмотренную';

      if (e?.status === 404) {
        if (e?.error?.detail?.includes('User not found')) {
          errorMessage =
            'Ваш профиль пользователя не найден в системе. Обратитесь к администратору.';
        } else if (e?.error?.detail?.includes('Enrollment not found')) {
          errorMessage = 'Вы не записаны на этот курс. Нажмите "Подписаться" и попробуйте снова.';
          this.subscribed = false; // Update local state
        } else {
          errorMessage = e?.error?.detail || 'Ресурс не найден';
        }
      } else if (e?.status === 403) {
        errorMessage = 'У вас нет прав для выполнения этого действия';
      } else if (e?.status === 500) {
        if (e?.error?.detail?.includes('enrollment')) {
          errorMessage = 'Ошибка проверки подписки на курс. Убедитесь, что вы подписаны на курс.';
        } else {
          errorMessage = e?.error?.detail || 'Внутренняя ошибка сервера';
        }
      } else if (e?.error?.detail) {
        errorMessage = e.error.detail;
      } else if (e?.error?.message) {
        errorMessage = e.error.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }

      // Add status code to error message for debugging
      if (e?.status) {
        errorMessage = `${errorMessage} (Код: ${e.status})`;
      }

      this.submitError.set(errorMessage);
    } finally {
      this.markingLecture.set(null);
    }
  }

  getLessonProgress(lessonId: string): { completed: number; total: number } {
    const progress = this.courseProgress();
    if (!progress) return { completed: 0, total: 0 };

    // Calculate progress for this lesson based on completed lectures
    const lesson = this.courseLessons().find((l) => l.id === lessonId);
    if (!lesson) return { completed: 0, total: 0 };

    const totalLectures = lesson.lectures?.length ?? 0;
    const completedLectures =
      lesson.lectures?.filter((lecture) => progress.completedLectureIds.includes(lecture.id))
        .length ?? 0;

    return {
      completed: completedLectures,
      total: totalLectures,
    };
  }

  getOverallProgress(): number {
    const progress = this.courseProgress();
    return progress?.progressPercent ?? 0;
  }
}
