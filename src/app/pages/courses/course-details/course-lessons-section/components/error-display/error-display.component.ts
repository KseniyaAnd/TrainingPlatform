import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-display',
  standalone: true,
  template: `
    @if (error()) {
      <div class="mt-4 text-red-600">
        {{ error() }}
      </div>
    }
  `,
})
export class ErrorDisplayComponent {
  readonly error = input<string | null>(null);
}
