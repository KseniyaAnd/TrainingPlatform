import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { LectureFormService } from '../../services/lecture-form.service';

@Component({
  selector: 'app-lecture-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './lecture-form.component.html',
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
