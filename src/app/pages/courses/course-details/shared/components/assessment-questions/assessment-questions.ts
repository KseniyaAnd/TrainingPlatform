import { Component, input } from '@angular/core';

@Component({
  selector: 'app-assessment-questions',
  standalone: true,
  imports: [],
  templateUrl: './assessment-questions.html',
})
export class AssessmentQuestionsComponent {
  readonly questions = input.required<string[]>();
}
