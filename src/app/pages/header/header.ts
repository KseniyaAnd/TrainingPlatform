import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthStateService } from '../../services/auth/auth-state.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly authStateService = inject(AuthStateService);
  private readonly authService = inject(AuthService);

  search = '';

  readonly isAuthenticated = this.authStateService.isAuthenticated;
  readonly username = this.authStateService.username;
  readonly role = this.authStateService.role;

  logout(): void {
    this.authService.logout();
  }
}
