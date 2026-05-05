import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { SubmissionResponse, SubmissionsPageResponse } from '../../../models/submission.model';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { SubmissionsService } from '../../../services/submissions/submissions.service';

@Component({
  selector: 'app-assessment-grading',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    MessageModule,
    TableModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './assessment-grading.html',
})
export class AssessmentGradingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly authState = inject(AuthStateService);
  private readonly messageService = inject(MessageService);

  readonly assessmentId = signal<string | null>(null);
  readonly submissions = signal<SubmissionResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  readonly hasMore = computed(() => this.nextCursor() !== null);

  // Track scores being edited
  readonly editingScores = signal<Map<string, number>>(new Map());

  readonly isTeacher = computed(() => this.authState.role() === 'TEACHER');

  ngOnInit(): void {
    // Check if user is a teacher
    if (!this.isTeacher()) {
      this.router.navigate(['/courses']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('assessmentId');
    if (id) {
      this.assessmentId.set(id);
      this.loadSubmissions();
    } else {
      this.error.set('Assessment ID is required');
    }
  }

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
        console.error('Error loading submissions:', err);
        this.error.set('Failed to load submissions. Please try again.');
        this.loading.set(false);
      },
    });
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (cursor) {
      this.loadSubmissions(cursor);
    }
  }

  getEditingScore(submissionId: string): number | null {
    return this.editingScores().get(submissionId) ?? null;
  }

  setEditingScore(submissionId: string, score: number | null): void {
    const scores = new Map(this.editingScores());
    if (score !== null) {
      scores.set(submissionId, score);
    } else {
      scores.delete(submissionId);
    }
    this.editingScores.set(scores);
  }

  startGrading(submission: SubmissionResponse): void {
    this.setEditingScore(submission.id, submission.score ?? 0);
  }

  cancelGrading(submissionId: string): void {
    const scores = new Map(this.editingScores());
    scores.delete(submissionId);
    this.editingScores.set(scores);
  }

  saveGrade(submission: SubmissionResponse): void {
    const score = this.getEditingScore(submission.id);

    if (score === null || score === undefined) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Пожалуйста, введите корректную оценку',
      });
      return;
    }

    if (score < 0 || score > 100) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Предупреждение',
        detail: 'Оценка должна быть от 0 до 100',
      });
      return;
    }

    console.log('Saving grade:', { submissionId: submission.id, score });
    this.loading.set(true);

    this.submissionsService.gradeSubmission(submission.id, score).subscribe({
      next: (updatedSubmission: SubmissionResponse) => {
        // Update the submission in the list with the response from server
        const updatedSubmissions = this.submissions().map((s) =>
          s.id === submission.id ? updatedSubmission : s,
        );
        this.submissions.set(updatedSubmissions);

        // Clear editing state
        this.cancelGrading(submission.id);

        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Оценка успешно сохранена',
        });

        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error saving grade:', err);

        let errorMessage = 'Не удалось сохранить оценку. Попробуйте снова.';
        if (err.error?.detail) {
          errorMessage = err.error.detail;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: errorMessage,
        });
        this.loading.set(false);
      },
    });
  }

  isGrading(submissionId: string): boolean {
    return this.editingScores().has(submissionId);
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Не оценено';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
