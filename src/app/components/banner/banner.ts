import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerComponent {
  readonly title = input('Welcome to Learning Platform');
  readonly subtitle = input('Explore courses and grow your skills');
  readonly ctaText = input('Get Started');
  readonly link = input('/courses');
  readonly imageUrl = input<string | null>('/assets/banner.png');

  readonly hasImage = computed(() => !!this.imageUrl());
}
