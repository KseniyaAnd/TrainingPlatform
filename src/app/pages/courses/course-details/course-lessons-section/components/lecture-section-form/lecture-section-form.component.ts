import { CommonModule } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { LectureSectionFormService } from '../../services/lecture-section-form.service';

@Component({
  selector: 'app-lecture-section-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './lecture-section-form.component.html',
})
export class LectureSectionFormComponent {
  readonly formService: LectureSectionFormService = inject(LectureSectionFormService);

  readonly onSubmit = output<void>();
  readonly onCancel = output<void>();

  submit(): void {
    this.onSubmit.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
