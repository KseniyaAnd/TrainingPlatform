import { Component, computed, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';

import { Assessment } from '../../../../models/assessment.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../../models/submission.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';
import { AssessmentQuestionsComponent } from '../shared/components/assessment-questions/assessment-questions';
import { SubmissionFormComponent } from '../shared/components/submission-form/submission-form';
import { AssessmentUiStateService } from './services/assessment-ui-state.service';
import { CourseAssessmentFormService } from './services/course-assessment-form.service';

@Component({
  selector: 'app-course-assessments-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectModule,
    ButtonComponent,
    AssessmentQuestionsComponent,
    SubmissionFormComponent,
  ],
  providers: [CourseAssessmentFormService, AssessmentUiStateService],
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

  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  readonly formService = inject(CourseAssessmentFormService);
  readonly uiState = inject(AssessmentUiStateService);

  // Expose form controls for template
  get titleControl() {
    return this.formService.form.get('title') as FormControl;
  }

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');

  // Фильтруем assessments только для уровня курса (без lectureId)
  readonly courseLevelAssessments = computed<(Assessment | AssessmentStudentResponse)[]>(() => {
    if (this.isStudent()) {
      // Для студентов используем studentAssessments
      return this.studentAssessments().filter((a) => !a.sourceId || a.sourceType === 'COURSE');
    } else {
      // Для преподавателей используем assessments
      return this.assessments().filter((a) => !a.sourceId || a.sourceType === 'COURSE');
    }
  });

  // ── UI State ──────────────────────────────────────────────────────────────

  toggleCollapsed(assessmentId: string): void {
    this.uiState.toggleCollapsed(assessmentId);
  }

  isCollapsed(assessmentId: string): boolean {
    return this.uiState.isCollapsed(assessmentId);
  }

  // ── Submission ────────────────────────────────────────────────────────────

  getSubmission(assessmentId: string): SubmissionResponse | null {
    return this.submissions().find((s) => s.assessmentId === assessmentId) ?? null;
  }

  gradeAssessment(assessment: Assessment): void {
    void this.router.navigate(['/assessments', assessment.id, 'grade']);
  }

  // ── Assessment Form ───────────────────────────────────────────────────────

  openAddAssessment(): void {
    this.formService.openAddAssessment();
  }

  openEditAssessment(assessment: Assessment): void {
    this.formService.openEditAssessment(assessment);
  }

  cancelAssessmentForm(): void {
    this.formService.cancel();
  }

  async saveAssessment(): Promise<void> {
    const result = await this.formService.submit(this.courseId(), this.assessments());
    if (result) {
      this.assessmentsChange.emit(result);
    }
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    const result = await this.formService.deleteAssessment(assessmentId, this.assessments());
    if (result) {
      this.assessmentsChange.emit(result);
    }
  }

  async generateAssessmentWithAI(): Promise<void> {
    await this.formService.generateAssessmentWithAI(this.courseId());
  }
}
