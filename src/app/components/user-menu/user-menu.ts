import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { ButtonComponent } from '../../shared/components/ui/button/button';
import { RoleCheckerService } from '../../shared/services/role-checker.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './user-menu.html',
})
export class UserMenuComponent {
  private readonly roleChecker = inject(RoleCheckerService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.roleChecker.isAuthenticated;
  readonly username = this.roleChecker.username;
  readonly isAdmin = this.roleChecker.isAdmin;

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}
