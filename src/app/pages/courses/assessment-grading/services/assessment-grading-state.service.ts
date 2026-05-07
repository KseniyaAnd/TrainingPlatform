import { computed, inject, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

import { SubmissionResponse, SubmissionsPageResponse } from '../../../../models/submission.model';
import { SubmissionsService } from '../../../../services/submissions/submissions.service';
import { extractErrorMessage, handleLoadError } from '../../../../shared/utils/error-handler.utils';

/**
 * Сервис для управления состоянием страницы оценивания assessments
 */
@Injectable()
export class AssessmentGradingStateService {
  private readonly submissionsService = inject(SubmissionsService);
  private readonly messageService = inject(MessageService);

  readonly assessmentId = signal<string | null>(null);
  readonly submissions = signal<SubmissionResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  readonly editingSubmissionId = signal<string | null>(null);

  readonly hasMore = computed(() => this.nextCursor() !== null);

  /**
   * Инициализировать с assessment ID
   */
  initialize(assessmentId: string): void {
    this.assessmentId.set(assessmentId);
    this.loadSubmissions();
  }

  /**
   * Загрузить submissions
   */
  loadSubmissions(cursor?: string): void {
    const id = this.assessmentId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.submissionsService.getAssessmentSubmissions(id, 20, cursor).subscribe({
      next: (response: SubmissionsPageResponse) => {
        const currentSubmissions = cursor ? this.submissions() : [];
        this.submissions.set([...currentSubmissions, ...response.items]);
        this.nextCursor.set(response.page.nextCursor);
        this.loading.set(false);
      },
      error: (err: any) => {
        const errorMessage = handleLoadError(err, 'submissions');
        this.error.set(errorMessage);
        this.loading.set(false);
      },
    });
  }

  /**
   * Загрузить больше submissions
   */
  loadMore(): void {
    const cursor = this.nextCursor();
    if (cursor) {
      this.loadSubmissions(cursor);
    }
  }

  /**
   * Начать редактирование submission
   */
  startEditing(submissionId: string): void {
    this.editingSubmissionId.set(submissionId);
  }

  /**
   * Отменить редактирование
   */
  cancelEditing(): void {
    this.editingSubmissionId.set(null);
  }

  /**
   * Сохранить оценку
   */
  saveGrade(submissionId: string, score: number): void {
    if (score < 0 || score > 100) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Оценка должна быть от 0 до 100',
      });
      return;
    }

    this.loading.set(true);

    this.submissionsService.gradeSubmission(submissionId, score).subscribe({
      next: (updatedSubmission: SubmissionResponse) => {
        // Update the submission in the list
        const updatedSubmissions = this.submissions().map((s) =>
          s.id === submissionId ? updatedSubmission : s,
        );
        this.submissions.set(updatedSubmissions);

        // Clear editing state
        this.editingSubmissionId.set(null);

        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Оценка успешно сохранена',
        });

        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error saving grade:', err);

        const errorMessage = extractErrorMessage(
          err.error?.detail || err,
          'Не удалось сохранить оценку. Попробуйте снова.',
        );

        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: errorMessage,
        });
        this.loading.set(false);
      },
    });
  }

  /**
   * Сбросить состояние
   */
  reset(): void {
    this.assessmentId.set(null);
    this.submissions.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.nextCursor.set(null);
    this.editingSubmissionId.set(null);
  }
}
