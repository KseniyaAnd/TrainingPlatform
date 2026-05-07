import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-tag',
  standalone: true,
  templateUrl: './tag.html',
})
export class TagComponent {
  readonly label = input.required<string>();
  readonly variant = input<'primary' | 'secondary' | 'success' | 'warning' | 'danger'>('primary');

  readonly tagClasses = computed(() => {
    const base = 'inline-block px-3 py-1 text-xs font-medium rounded-full';

    const variants = {
      primary: 'bg-primary-400 text-white',
      secondary: 'bg-gray-300 text-gray-700',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      danger: 'bg-red-500 text-white',
    };

    return `${base} ${variants[this.variant()]}`;
  });
}
