import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-chip',
  standalone: true,
  templateUrl: './chip.html',
})
export class ChipComponent {
  readonly active = input(false);
  readonly size = input<'sm' | 'md'>('md');
  readonly clicked = output<void>();

  readonly classes = computed(() => {
    const base = 'rounded-full border font-medium transition-all duration-200 whitespace-nowrap';

    const sizes = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
    };

    const state = this.active()
      ? 'bg-primary-400 text-white border-primary-400'
      : 'bg-transparent text-primary-400 border-primary-400 hover:bg-primary-50';

    return `${base} ${sizes[this.size()]} ${state}`;
  });
}
