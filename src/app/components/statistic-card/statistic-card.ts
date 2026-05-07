import { Component, input } from '@angular/core';

@Component({
  selector: 'app-statistic-card',
  standalone: true,
  templateUrl: './statistic-card.html',
})
export class StatisticCardComponent {
  readonly icon = input.required<string>();
  readonly value = input.required<number | string>();
  readonly label = input.required<string>();
}
