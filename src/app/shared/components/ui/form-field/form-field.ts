import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.html',
})
export class FormFieldComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly required = input(false);
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
}
