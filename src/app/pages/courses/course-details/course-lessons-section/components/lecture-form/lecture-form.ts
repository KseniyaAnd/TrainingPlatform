import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { LectureFormService } from '../../services/lecture-form.service';

@Component({
  selector: 'app-lecture-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './lecture-form.html',
})
export class LectureFormComponent {
  readonly formService: LectureFormService = inject(LectureFormService);
  readonly lessonId = input.required<string>();

  readonly onSubmit = output<void>();
  readonly onCancel = output<void>();

  submit(): void {
    this.onSubmit.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
