import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../models/assessment.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../../models/submission.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { AssessmentDifficulty, CourseDetailsDataService } from '../course-details-data.service';

@Component({
  selector: 'app-course-assessments-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './course-assessments-list.html',
})
export class CourseAssessmentsListComponent {
  readonly courseId = input.required<string>();
  readonly assessments = input<Assessment[]>([]);
  readonly studentAssessments = input<AssessmentStudentResponse[]>([]);
  readonly submissions = input<SubmissionResponse[]>([]);
  readonly editMode = input<boolean>(false);

  readonly assessmentsChange = output<Assessment[]>();
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

  readonly submittingAssessmentId = signal<string | null>(null);
  readonly collapsedAssessments = signal<Set<string>>(new Set());
  readonly editingAssessmentId = signal<string | null>(null);
  readonly showAddForm = signal(false);
  readonly savingAssessment = signal(false);
  readonly generatingWithAI = signal(false);

  readonly submissionForm = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly assessmentForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    questions: [''],
    answerKey: [''],
    rubricCriteria: [''],
    generateWithAI: [false],
    questionCount: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
    difficulty: ['MEDIUM' as AssessmentDifficulty, Validators.required],
  });

  // Фильтруем assessments только для уровня курса (без lectureId)
  readonly courseLevelAssessments = computed(() => {
    return this.assessments().filter((a) => !a.sourceId || a.sourceType === 'COURSE');
  });

  toggleCollapsed(assessmentId: string): void {
    const collapsed = this.collapsedAssessments();
    const newSet = new Set(collapsed);
    if (newSet.has(assessmentId)) {
      newSet.delete(assessmentId);
    } else {
      newSet.add(assessmentId);
    }
    this.collapsedAssessments.set(newSet);
  }

  isCollapsed(assessmentId: string): boolean {
    return this.collapsedAssessments().has(assessmentId);
  }

  getSubmission(assessmentId: string): SubmissionResponse | null {
    return this.submissions().find((s) => s.assessmentId === assessmentId) ?? null;
  }

  async submitAnswer(assessment: Assessment): Promise<void> {
    if (this.submissionForm.invalid) return;

    this.submittingAssessmentId.set(assessment.id);
    try {
      const submission = await firstValueFrom(
        this.dataService.createSubmission(
          assessment.id,
          this.submissionForm.controls.answerText.value,
        ),
      );
      this.submissionsChange.emit([...this.submissions(), submission]);
      this.submissionForm.reset();
    } catch (e) {
      console.error('Failed to submit answer:', e);
    } finally {
      this.submittingAssessmentId.set(null);
    }
  }

  gradeAssessment(assessment: Assessment): void {
    void this.router.navigate(['/assessments', assessment.id, 'grade']);
  }

  // ── Assessment editing ────────────────────────────────────────────────────
  openAddAssessment(): void {
    this.assessmentForm.reset({
      title: '',
      description: '',
      questions: '',
      answerKey: '',
      rubricCriteria: '',
      generateWithAI: false,
      questionCount: 3,
      difficulty: 'MEDIUM',
    });
    this.editingAssessmentId.set(null);
    this.showAddForm.set(true);
  }

  openEditAssessment(assessment: Assessment): void {
    this.assessmentForm.reset({
      title: assessment.title ?? '',
      description: assessment.description ?? '',
      questions: (assessment.questions ?? []).join('\n'),
      answerKey: (assessment.answerKey ?? []).join('\n'),
      rubricCriteria: (assessment.rubricCriteria ?? []).join('\n'),
      generateWithAI: false,
      questionCount: 3,
      difficulty: 'MEDIUM',
    });
    this.editingAssessmentId.set(assessment.id);
    this.showAddForm.set(false);
  }

  cancelAssessmentForm(): void {
    this.editingAssessmentId.set(null);
    this.showAddForm.set(false);
    this.assessmentForm.reset();
  }

  async saveAssessment(): Promise<void> {
    if (this.assessmentForm.invalid || this.savingAssessment()) return;

    this.savingAssessment.set(true);
    try {
      const formValue = this.assessmentForm.getRawValue();
      const payload = {
        courseId: this.courseId(),
        title: formValue.title,
        description: formValue.description || '',
        questions: formValue.questions
          ? formValue.questions.split('\n').filter((q) => q.trim())
          : [],
        answerKey: formValue.answerKey
          ? formValue.answerKey.split('\n').filter((a) => a.trim())
          : [],
        rubricCriteria: formValue.rubricCriteria
          ? formValue.rubricCriteria.split('\n').filter((r) => r.trim())
          : [],
      };

      const editingId = this.editingAssessmentId();
      if (editingId) {
        // Update existing
        const updated = await firstValueFrom(this.dataService.updateAssessment(editingId, payload));
        const newList = this.assessments().map((a) => (a.id === editingId ? updated : a));
        this.assessmentsChange.emit(newList);
      } else {
        // Create new
        const created = await firstValueFrom(this.dataService.createAssessment(payload));
        this.assessmentsChange.emit([...this.assessments(), created]);
      }

      this.cancelAssessmentForm();
    } catch (e) {
      console.error('Failed to save assessment:', e);
    } finally {
      this.savingAssessment.set(false);
    }
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    if (!confirm('Удалить assessment?')) return;

    try {
      await firstValueFrom(this.dataService.deleteAssessment(assessmentId));
      const newList = this.assessments().filter((a) => a.id !== assessmentId);
      this.assessmentsChange.emit(newList);
      this.cancelAssessmentForm();
    } catch (e) {
      console.error('Failed to delete assessment:', e);
    }
  }

  async generateAssessmentWithAI(): Promise<void> {
    const title = this.assessmentForm.controls.title.value.trim();

    if (!title) {
      alert('Пожалуйста, введите название assessment перед генерацией');
      return;
    }

    this.generatingWithAI.set(true);
    try {
      const questionCount = this.assessmentForm.controls.questionCount.value;
      const difficulty = this.assessmentForm.controls.difficulty.value;

      const draft = await firstValueFrom(
        this.dataService.generateAssessmentDraft({
          courseId: this.courseId(),
          questionCount,
          difficulty,
        }),
      );

      // Заполняем форму сгенерированными данными
      this.assessmentForm.patchValue(
        {
          title: draft.title || title,
          description: draft.description,
          questions: (draft.questions ?? []).join('\n'),
          answerKey: (draft.answerKey ?? []).join('\n'),
          rubricCriteria: (draft.rubricCriteria ?? []).join('\n'),
        },
        { emitEvent: false },
      );
    } catch (e) {
      console.error('Failed to generate assessment with AI:', e);
      alert('Не удалось сгенерировать assessment с помощью AI');
    } finally {
      this.generatingWithAI.set(false);
    }
  }
}
