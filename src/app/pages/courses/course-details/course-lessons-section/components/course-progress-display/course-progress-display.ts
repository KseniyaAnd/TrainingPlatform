import { Component, input } from '@angular/core';

@Component({
  selector: 'app-course-progress-display',
  standalone: true,
  templateUrl: './course-progress-display.html',
})
export class CourseProgressDisplayComponent {
  readonly progressPercent = input<number | null>(null);
}
