import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../models/assessment.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../../models/submission.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import {
  AssessmentDifficulty,
  AssessmentDraftResponse,
} from '../../../../services/courses/course-content.service';
import { CourseDetailsDataService } from '../course-details-data.service';
import { LessonWithLectures } from '../course-lessons-section/course-lessons-section';

@Component({
  selector: 'app-course-assessments-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, CardModule, TagModule, MessageModule],
  templateUrl: './course-assessments-section.html',
  styles: `
    :host ::ng-deep .p-card .black-color {
      color: #111827 !important;
    }
  `,
})
export class CourseAssessmentsSectionComponent {
  readonly courseId = input.required<string>();
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly editMode = input<boolean>(false);

  // Teacher inputs
  readonly assessments = input<Assessment[]>([]);
  readonly assessmentsChange = output<Assessment[]>();

  // Student inputs
  readonly studentAssessments = input<AssessmentStudentResponse[]>([]);
  readonly submissions = input<SubmissionResponse[]>([]);
  readonly submissionsChange = output<SubmissionResponse[]>();

  private readonly dataService = inject(CourseDetailsDataService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');

  readonly lessonsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lesson'));
  readonly allLectures = computed(() => this.lessons().flatMap((l) => l.lectures ?? []));

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submittingAssessmentId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly useAi = signal(false);
  readonly isDraftMode = signal(false);
  readonly draft = signal<AssessmentDraftResponse | null>(null);
  readonly draftLessonId = signal<string>('');
  readonly generatingDraft = signal(false);

  readonly form = this.fb.nonNullable.group({
    lessonId: ['', [Validators.required]],
    lectureId: [''],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    questionsText: ['', [Validators.required]],
    answerKeyText: ['', [Validators.required]],
    rubricCriteriaText: ['', [Validators.required]],
  });

  readonly aiForm = this.fb.nonNullable.group({
    lessonId: ['', [Validators.required]],
    questionCount: [5, [Validators.required]],
    difficulty: ['MEDIUM' as AssessmentDifficulty, [Validators.required]],
  });

  readonly submissionForm = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  openAdd(): void {
    const lessonId = this.lessonsOnly()[0]?.id;
    if (!lessonId) {
      this.error.set('Add a lesson first');
      return;
    }
    const lectureId = this.lessons().find((l) => l.id === lessonId)?.lectures?.[0]?.id ?? '';

    this.showForm.set(true);
    this.editingId.set(null);
    this.error.set(null);
    this.useAi.set(false);
    this.isDraftMode.set(false);
    this.draft.set(null);

    this.form.reset({
      lessonId,
      lectureId,
      title: '',
      description: '',
      questionsText: '',
      answerKeyText: '',
      rubricCriteriaText: '',
    });
    this.aiForm.reset({
      lessonId,
      questionCount: 5,
      difficulty: 'MEDIUM',
    });
    this.draftLessonId.set(lessonId);
  }

  openEdit(a: Assessment): void {
    this.showForm.set(true);
    this.editingId.set(a.id);
    this.error.set(null);
    this.useAi.set(false);
    this.isDraftMode.set(false);
    this.draft.set(null);

    this.form.reset({
      lessonId: a.lessonId ?? this.lessonsOnly()[0]?.id ?? '',
      lectureId: a.lectureId ?? '',
      title: a.title ?? '',
      description: a.description ?? '',
      questionsText: this.joinLines(a.questions ?? []),
      answerKeyText: this.joinLines(a.answerKey ?? []),
      rubricCriteriaText: this.joinLines(a.rubricCriteria ?? []),
    });
  }

  cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.error.set(null);
    this.useAi.set(false);
    this.isDraftMode.set(false);
    this.draft.set(null);
    this.draftLessonId.set('');
  }

  setUseAi(val: boolean): void {
    this.useAi.set(val);
    if (!val) {
      this.isDraftMode.set(false);
      this.draft.set(null);
      this.draftLessonId.set('');
    }
  }

  onLessonChange(): void {
    const lessonId = this.form.controls.lessonId.value;
    const lectures = this.lessons().find((l) => l.id === lessonId)?.lectures ?? [];
    const currentLectureId = this.form.controls.lectureId.value;
    if (!lectures.some((l) => l.id === currentLectureId)) {
      this.form.controls.lectureId.setValue(lectures[0]?.id ?? '');
    }
    this.aiForm.controls.lessonId.setValue(lessonId ?? '');
    this.draftLessonId.set(lessonId ?? '');
  }

  lecturesForLesson(): Array<{ id: string; title: string }> {
    const lessonId = this.form.controls.lessonId.value;
    return this.lessons().find((l) => l.id === lessonId)?.lectures ?? [];
  }

  async generateDraft(): Promise<void> {
    if (this.aiForm.invalid || this.generatingDraft()) return;
    const lessonId = this.aiForm.controls.lessonId.value;
    if (!lessonId) return;

    // Получаем lectureId из формы, если он выбран
    const lectureId = this.form.controls.lectureId.value;

    this.error.set(null);
    try {
      this.generatingDraft.set(true);

      // Отправляем либо lectureId (если выбран), либо lessonId
      const payload: any = {
        courseId: this.courseId(),
        questionCount: Number(this.aiForm.controls.questionCount.value),
        difficulty: this.aiForm.controls.difficulty.value,
      };

      if (lectureId) {
        payload.lectureId = lectureId;
      } else {
        payload.lessonId = lessonId;
      }

      const d = await firstValueFrom(this.dataService.generateAssessmentDraft(payload));
      this.draft.set(d);
      this.isDraftMode.set(true);
      this.draftLessonId.set(lessonId);
      this.form.patchValue({
        title: d.title ?? '',
        description: d.description ?? '',
        questionsText: this.joinLines(d.questions ?? []),
        answerKeyText: this.joinLines(d.answerKey ?? []),
        rubricCriteriaText: this.joinLines(d.rubricCriteria ?? []),
      });
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to generate draft');
    } finally {
      this.generatingDraft.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting()) return;

    const questions = this.parseLines(this.form.controls.questionsText.value);
    const answerKey = this.parseLines(this.form.controls.answerKeyText.value);
    const rubricCriteria = this.parseLines(this.form.controls.rubricCriteriaText.value);

    if (!questions.length || !answerKey.length || !rubricCriteria.length) {
      this.error.set('Questions, answer key, and rubric criteria are required');
      return;
    }

    const lessonId = this.form.controls.lessonId.value;
    const lectureId = this.form.controls.lectureId.value;
    if (!lessonId) {
      this.error.set('Lesson is required');
      return;
    }

    this.error.set(null);
    try {
      this.submitting.set(true);
      const editingId = this.editingId();
      const payload = {
        title: this.form.controls.title.value,
        description: this.form.controls.description.value,
        questions,
        answerKey,
        rubricCriteria,
      };

      const saved = editingId
        ? await firstValueFrom(this.dataService.updateAssessment(editingId, payload))
        : this.useAi() && this.isDraftMode()
          ? await firstValueFrom(
              this.dataService.createAssessmentFromDraft({
                courseId: this.courseId(),
                lessonId: this.draftLessonId(),
                ...payload,
              }),
            )
          : await firstValueFrom(
              this.dataService.createAssessment({
                courseId: this.courseId(),
                ...(lectureId ? { lectureId } : { lessonId }),
                ...payload,
              }),
            );

      if (editingId) {
        this.assessmentsChange.emit(
          this.assessments().map((a) => (a.id === editingId ? saved : a)),
        );
      } else {
        this.assessmentsChange.emit([saved, ...this.assessments()]);
      }
      this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to save assessment');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteAssessment(a: Assessment): Promise<void> {
    if (!confirm('Удалить assessment?')) return;
    try {
      this.submitting.set(true);
      await firstValueFrom(this.dataService.deleteAssessment(a.id));
      this.assessmentsChange.emit(this.assessments().filter((x) => x.id !== a.id));
      if (this.editingId() === a.id) this.cancel();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to delete assessment');
    } finally {
      this.submitting.set(false);
    }
  }

  gradeAssessment(a: Assessment): void {
    void this.router.navigate(['/assessments', a.id, 'grade']);
  }

  getSubmission(assessmentId: string): SubmissionResponse | null {
    return this.submissions().find((s) => s.assessmentId === assessmentId) ?? null;
  }

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

  private joinLines(items: string[]): string {
    return (items ?? []).join('\n');
  }

  private parseLines(raw: string): string[] {
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }
}
