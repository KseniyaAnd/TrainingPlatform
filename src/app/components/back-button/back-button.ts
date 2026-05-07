import { Location } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../shared/components/ui/button/button';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [ButtonComponent],
  host: {
    class: 'mb-4 inline-block',
  },
  templateUrl: './back-button.html',
})
export class BackButtonComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly label = input('Назад');
  readonly route = input<string | null>(null);
  readonly clicked = output<void>();

  handleClick(): void {
    const route = this.route();
    if (route) {
      void this.router.navigate([route]);
    } else {
      this.location.back();
    }
    this.clicked.emit();
  }
}
