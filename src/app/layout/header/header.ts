import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { SearchBarComponent } from '../../components/search-bar/search-bar';
import { UserMenuComponent } from '../../components/user-menu/user-menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ButtonModule, SearchBarComponent, UserMenuComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly router = inject(Router);

  navigateToCourses(): void {
    void this.router.navigate(['/courses']);
  }
}
