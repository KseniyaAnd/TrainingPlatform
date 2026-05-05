import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { Assessment } from '../../../../../../models/assessment.model';
import { SubmissionResponse } from '../../../../../../models/submission.model';
import { SubmissionFormService } from '../../services/submission-form.service';

@Component({
  selector: 'app-submission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  providers: [SubmissionFormService],
  templateUrl: './submission-form.component.html',
})
export class SubmissionFormComponent {
  readonly assessment = input.required<Assessment>();
  readonly submission = input<SubmissionResponse | null>(null);
  readonly submissionsChange = output<SubmissionResponse[]>();
  readonly currentSubmissions = input<SubmissionResponse[]>([]);

  constructor(readonly formService: SubmissionFormService) {}

  async onSubmit(): Promise<void> {
    const result = await this.formService.submitAnswer(
      this.assessment(),
      this.currentSubmissions(),
    );
    if (result) {
      this.submissionsChange.emit(result);
    }
  }
}
