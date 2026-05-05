import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lesson-content',
  standalone: true,
  imports: [CommonModule],
  template: `<div>
    <p class="text-gray-700 whitespace-pre-wrap">{{ content() }}</p>
  </div>`,
})
export class LessonContentComponent {
  readonly content = input.required<string>();
}
