import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './empty-state.html',
})
export class EmptyStateComponent {
  readonly icon = input<string>('pi-inbox');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input<string | null>(null);
  readonly actionLink = input<string | null>(null);
  readonly actionVariant = input<'primary' | 'secondary' | 'ghost'>('primary');
  readonly action = output<void>();
}
