import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, ButtonModule],
  templateUrl: './banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host ::ng-deep .p-button {
      color: white !important;
      border-color: white !important;
    }
  `,
})
export class Banner {
  readonly title = input('Welcome to Learning Platform');
  readonly subtitle = input('Explore courses and grow your skills');
  readonly ctaText = input('Get Started');
  readonly link = input('/courses');
  readonly imageUrl = input<string | null>('/assets/banner.png');

  readonly hasImage = computed(() => !!this.imageUrl());
}
