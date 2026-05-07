import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [ProgressSpinnerModule, MessageModule, ButtonComponent],
  templateUrl: './loading-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly isEmpty = input(false);
  readonly loadingText = input('Загрузка...');
  readonly emptyText = input('Нет данных');
  readonly emptyIcon = input('pi pi-inbox');
  readonly showRetry = input(true);
  readonly retry = output<void>();
}
