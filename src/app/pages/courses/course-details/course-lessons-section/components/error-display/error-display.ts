import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-display',
  standalone: true,
  templateUrl: './error-display.html',
})
export class ErrorDisplayComponent {
  readonly error = input<string | null>(null);
}
