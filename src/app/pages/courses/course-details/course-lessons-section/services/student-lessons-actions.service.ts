import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import {
  AssessmentStudentResponse,
  SubmissionResponse,
} from '../../../../../models/submission.model';
import { AuthStateService } from '../../../../../services/auth/auth-state.service';
import { CourseDataService } from '../../../../../services/courses/course-data.service';

/**
 * Сервис для действий студента с уроками
 * Управляет отметкой лекций как завершенных и отправкой ответов на assessments
 */
@Injectable()
export class StudentLessonsActionsService {
  private readonly dataService = inject(CourseDataService);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);

  readonly markingLecture = signal<string | null>(null);
  readonly submittingAssessmentId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly submissionForm: FormGroup = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  /**
   * Отметить лекцию как завершенную
   */
  async markLectureCompleted(courseId: string, lectureId: string): Promise<boolean> {
    if (this.markingLecture()) return false;

    const userId = this.authState.getUserId();
    if (!userId) {
      this.error.set('User ID не найден. Пожалуйста, выйдите и войдите заново.');
      return false;
    }

    this.markingLecture.set(lectureId);
    this.error.set(null);

    try {
      await firstValueFrom(this.dataService.markLectureCompleted(courseId, userId, lectureId));
      return true;
    } catch (e: any) {
      this.error.set(e?.error?.detail ?? e?.message ?? 'Не удалось отметить лекцию');
      return false;
    } finally {
      this.markingLecture.set(null);
    }
  }

  /**
   * Отправить ответ на assessment
   */
  async submitAnswer(
    assessment: AssessmentStudentResponse,
    currentSubmissions: SubmissionResponse[],
  ): Promise<SubmissionResponse[] | null> {
    if (this.submittingAssessmentId()) return null;

    this.error.set(null);

    if (this.submissionForm.invalid) {
      this.error.set('Пожалуйста, заполните ответ');
      return null;
    }

    this.submittingAssessmentId.set(assessment.id);

    try {
      const sub = await firstValueFrom(
        this.dataService.createSubmission(
          assessment.id,
          this.submissionForm.controls['answerText'].value,
        ),
      );
      this.submissionForm.reset();
      return [sub, ...currentSubmissions];
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Не удалось отправить ответ');
      return null;
    } finally {
      this.submittingAssessmentId.set(null);
    }
  }

  /**
   * Сбросить состояние
   */
  reset(): void {
    this.markingLecture.set(null);
    this.submittingAssessmentId.set(null);
    this.error.set(null);
    this.submissionForm.reset();
  }
}
