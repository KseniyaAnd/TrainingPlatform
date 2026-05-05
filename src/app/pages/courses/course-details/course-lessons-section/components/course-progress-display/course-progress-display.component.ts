import { Component, input } from '@angular/core';

@Component({
  selector: 'app-course-progress-display',
  standalone: true,
  template: `
    @if (progressPercent() !== null) {
      <div class="text-sm text-gray-600">
        Прогресс:
        <span class="font-semibold text-emerald-600">{{ progressPercent() }}%</span>
      </div>
    }
  `,
})
export class CourseProgressDisplayComponent {
  readonly progressPercent = input<number | null>(null);
}
