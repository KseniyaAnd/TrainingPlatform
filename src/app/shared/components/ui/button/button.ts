import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './button.html',
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'primary' | 'secondary' | 'danger' | 'ghost' | 'outlined'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly icon = input<string>();
  readonly iconOnly = input(false);
  readonly fullWidth = input(false);
  readonly routerLink = input<string | string[]>();
  readonly queryParams = input<Record<string, string>>();
  readonly ariaLabel = input<string>();
  readonly label = input<string>(); // Добавляем label input
  readonly clicked = output<void>();

  readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none';

    const sizes = {
      sm: this.iconOnly() ? 'size-8 text-sm' : 'px-3 py-1.5 text-sm',
      md: this.iconOnly() ? 'size-10 text-base' : 'px-4 py-2 text-base',
      lg: this.iconOnly() ? 'size-12 text-lg' : 'px-6 py-3 text-lg',
    };

    const variants = {
      primary: 'bg-primary-400 text-white hover:bg-primary-500 disabled:bg-primary-200',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
      danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-200',
      ghost:
        'bg-transparent text-primary-400 border border-primary-400 hover:bg-primary-100 disabled:border-primary-200 disabled:text-primary-200',
      outlined:
        'bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50 disabled:border-primary-200 disabled:text-primary-200',
    };

    const shape = this.iconOnly() ? 'rounded-full' : 'rounded-md';
    const width = this.fullWidth() ? 'w-full' : '';
    const disabled =
      this.disabled() || this.loading() ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

    return `${base} ${sizes[this.size()]} ${variants[this.variant()]} ${shape} ${width} ${disabled}`;
  });
}
