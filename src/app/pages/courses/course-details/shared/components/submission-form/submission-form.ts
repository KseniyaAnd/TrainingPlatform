import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Assessment } from '../../../../../../models/assessment.model';
import { SubmissionResponse } from '../../../../../../models/submission.model';
import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { SubmissionFormService } from '../../services/submission-form.service';

@Component({
  selector: 'app-submission-form',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ButtonComponent],
  providers: [SubmissionFormService],
  templateUrl: './submission-form.html',
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
