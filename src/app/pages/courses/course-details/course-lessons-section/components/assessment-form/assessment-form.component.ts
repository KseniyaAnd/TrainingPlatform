import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { AssessmentFormService } from '../../services/assessment-form.service';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './assessment-form.component.html',
})
export class AssessmentFormComponent {
  readonly formService = inject(AssessmentFormService);
  readonly courseId = input.required<string>();

  readonly onSubmit = output<void>();
  readonly onCancel = output<void>();

  submit(): void {
    this.onSubmit.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }

  generateDraft(): void {
    void this.formService.generateDraft(this.courseId());
  }

  setUseAi(checked: boolean): void {
    this.formService.setUseAi(checked);
  }
}
