import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

import { SubmissionResponse } from '../../../../models/submission.model';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';

@Component({
  selector: '[app-submission-row]',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputNumberModule],
  templateUrl: './submission-row.html',
})
export class SubmissionRowComponent {
  readonly submission = input.required<SubmissionResponse>();
  readonly isEditing = input(false);
  readonly disabled = input(false);
  readonly edit = output<void>();
  readonly save = output<number>();
  readonly cancel = output<void>();
  readonly viewDetails = output<void>();

  editScore = 0;

  handleEdit(): void {
    this.editScore = this.submission().score ?? 0;
    this.edit.emit();
  }

  handleSave(): void {
    this.save.emit(this.editScore);
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
