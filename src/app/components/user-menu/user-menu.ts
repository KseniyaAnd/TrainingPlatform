import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthStateService } from '../../services/auth/auth-state.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './user-menu.html',
})
export class UserMenuComponent {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly username = this.authState.username;
  readonly isAdmin = computed(() => this.authState.role() === 'ADMIN');

  logout(): void {
    this.authService.logout();
  }
}
