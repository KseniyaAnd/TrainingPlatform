import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [ProgressSpinnerModule, MessageModule],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center py-12">
        <p-progress-spinner styleClass="w-12 h-12" strokeWidth="4" animationDuration="1s" />
      </div>
    }

    @if (error()) {
      <p-message severity="error" styleClass="w-full mt-4">
        <span class="font-medium">{{ error() }}</span>
      </p-message>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
}
