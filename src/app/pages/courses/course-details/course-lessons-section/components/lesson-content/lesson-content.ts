import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lesson-content',
  standalone: true,
  imports: [],
  templateUrl: './lesson-content.html',
})
export class LessonContentComponent {
  readonly content = input.required<string>();
}
