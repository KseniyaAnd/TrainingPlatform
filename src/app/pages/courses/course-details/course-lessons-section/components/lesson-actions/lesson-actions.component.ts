import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-lesson-actions',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <button
      pButton
      type="button"
      label="Добавить урок"
      [style]="'background-color: #10b981; border-color: #10b981;'"
      (click)="onAddLesson.emit()"
    ></button>
  `,
})
export class LessonActionsComponent {
  readonly onAddLesson = output<void>();
}
