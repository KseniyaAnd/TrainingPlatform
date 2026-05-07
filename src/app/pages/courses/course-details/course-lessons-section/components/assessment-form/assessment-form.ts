import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { AssessmentFormService } from '../../services/assessment-form.service';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './assessment-form.html',
})
export class AssessmentFormComponent {
  readonly formService = inject(AssessmentFormService);
  readonly courseId = input.required<string>();

  readonly onSubmit = output<void>();
  readonly onCancel = output<void>();
  readonly onDelete = output<void>();

  submit(): void {
    this.onSubmit.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }

  deleteAssessment(): void {
    if (confirm('Вы уверены, что хотите удалить этот assessment?')) {
      this.onDelete.emit();
    }
  }

  generateDraft(): void {
    void this.formService.generateDraft(this.courseId());
  }

  setUseAi(checked: boolean): void {
    this.formService.setUseAi(checked);
  }
}
