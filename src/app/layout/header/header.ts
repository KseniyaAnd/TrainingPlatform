import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LogoComponent } from '../../components/logo/logo';
import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { UserMenuComponent } from '../../components/user-menu/user-menu';
import { ButtonComponent } from '../../shared/components/ui/button/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonComponent, LogoComponent, SearchBarComponent, UserMenuComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly router = inject(Router);

  navigateToCourses(): void {
    void this.router.navigate(['/courses']);
  }
}
