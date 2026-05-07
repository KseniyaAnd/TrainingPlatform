import { Component, inject, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { LectureSectionFormService } from '../../services/lecture-section-form.service';

@Component({
  selector: 'app-lecture-section-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './lecture-section-form.html',
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
