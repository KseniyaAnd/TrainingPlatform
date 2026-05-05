import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-assessment-questions',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (questions().length > 0) {
      <div>
        <h4 class="text-lg font-semibold mb-2">Вопросы:</h4>
        <div class="space-y-2">
          @for (question of questions(); track $index) {
            <p class="text-gray-700">{{ $index + 1 }}. {{ question }}</p>
          }
        </div>
      </div>
    }
  `,
})
export class AssessmentQuestionsComponent {
  readonly questions = input.required<string[]>();
}
