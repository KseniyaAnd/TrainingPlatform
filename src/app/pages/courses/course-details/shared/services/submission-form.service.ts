import { Injectable, inject, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../../models/assessment.model';
import { SubmissionResponse } from '../../../../../models/submission.model';
import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { BaseFormService } from '../../../../../shared/services/base-form.service';

/**
 * Общий сервис для управления формой отправки ответов студентов на assessments
 */
@Injectable()
export class SubmissionFormService extends BaseFormService {
  private readonly dataService = inject(CourseDataService);

  readonly submittingAssessmentId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  createForm(data?: any): FormGroup {
    return this.fb.nonNullable.group({
      answerText: [data?.answerText ?? '', [Validators.required, Validators.minLength(10)]],
    });
  }

  async submitAnswer(
    assessment: Assessment,
    currentSubmissions: SubmissionResponse[],
  ): Promise<SubmissionResponse[] | null> {
    if (this.form.invalid || this.submittingAssessmentId()) {
      this.setError('Пожалуйста, заполните ответ (минимум 10 символов)');
      return null;
    }

    this.setError(null);
    this.submittingAssessmentId.set(assessment.id);

    try {
      const submission = await firstValueFrom(
        this.dataService.createSubmission(assessment.id, this.form.controls.answerText.value),
      );
      this.form.reset();
      return [submission, ...currentSubmissions];
    } catch (e) {
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.submittingAssessmentId.set(null);
    }
  }

  reset(): void {
    this.form.reset();
    this.setError(null);
    this.submittingAssessmentId.set(null);
  }
}
