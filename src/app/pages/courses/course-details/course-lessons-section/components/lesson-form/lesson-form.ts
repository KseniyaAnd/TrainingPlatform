import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { LessonFormService } from '../../services/lesson-form.service';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './lesson-form.html',
})
export class LessonFormComponent {
  readonly formService = inject(LessonFormService);

  readonly onSubmit = output<void>();
  readonly onCancel = output<void>();

  submit(): void {
    this.onSubmit.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
