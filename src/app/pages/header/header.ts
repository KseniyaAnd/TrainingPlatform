import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthStateService } from '../../services/auth/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly authStateService = inject(AuthStateService);

  search = '';

  readonly isAuthenticated = this.authStateService.isAuthenticated;

  logout(): void {
    this.authStateService.logout();
  }
}
