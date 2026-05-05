import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../../models/assessment.model';
import { SubmissionResponse } from '../../../../../models/submission.model';
import { CourseDetailsDataService } from '../../course-details-data.service';

/**
 * Общий сервис для управления формой отправки ответов студентов на assessments
 */
@Injectable()
export class SubmissionFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly submittingAssessmentId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  async submitAnswer(
    assessment: Assessment,
    currentSubmissions: SubmissionResponse[],
  ): Promise<SubmissionResponse[] | null> {
    if (this.form.invalid || this.submittingAssessmentId()) {
      this.error.set('Пожалуйста, заполните ответ (минимум 10 символов)');
      return null;
    }

    this.error.set(null);
    this.submittingAssessmentId.set(assessment.id);

    try {
      const submission = await firstValueFrom(
        this.dataService.createSubmission(assessment.id, this.form.controls.answerText.value),
      );
      this.form.reset();
      return [submission, ...currentSubmissions];
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Не удалось отправить ответ');
      return null;
    } finally {
      this.submittingAssessmentId.set(null);
    }
  }

  reset(): void {
    this.form.reset();
    this.error.set(null);
    this.submittingAssessmentId.set(null);
  }
}
