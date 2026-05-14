import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

import { BackButtonComponent } from '../../../components/back-button/back-button';
import { SubmissionResponse } from '../../../models/submission.model';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button';
import { LoadingStateComponent } from '../../../shared/components/ui/loading-state/loading-state';
import { AssessmentGradingStateService } from './services/assessment-grading-state.service';
import { SubmissionRowComponent } from './submission-row/submission-row';

@Component({
  selector: 'app-assessment-grading',
  standalone: true,
  imports: [
    ButtonComponent,
    TableModule,
    DialogModule,
    BackButtonComponent,
    LoadingStateComponent,
    SubmissionRowComponent,
  ],
  providers: [MessageService, AssessmentGradingStateService],
  templateUrl: './assessment-grading.html',
})
export class AssessmentGradingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  readonly state = inject(AssessmentGradingStateService);

  readonly isTeacher = computed(() => this.authState.role() === 'TEACHER');

  showDetailsModal = false;
  selectedSubmission: SubmissionResponse | null = null;

  ngOnInit(): void {
    // Check if user is a teacher
    if (!this.isTeacher()) {
      this.router.navigate(['/courses']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('assessmentId');
    if (id) {
      this.state.initialize(id);
    } else {
      this.state.error.set('Assessment ID is required');
    }
  }

  loadMore(): void {
    this.state.loadMore();
  }

  startEditing(submissionId: string): void {
    this.state.startEditing(submissionId);
  }

  cancelEditing(): void {
    this.state.cancelEditing();
  }

  saveGrade(submissionId: string, score: number): void {
    this.state.saveGrade(submissionId, score);
  }

  viewSubmissionDetails(submission: SubmissionResponse): void {
    this.selectedSubmission = submission;
    this.showDetailsModal = true;
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
