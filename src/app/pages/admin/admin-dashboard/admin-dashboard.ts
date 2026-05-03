import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { PlatformStatistics } from '../../../models/analytics.model';
import { AdminService } from '../../../services/admin/admin.service';
import { AuthStateService } from '../../../services/auth/auth-state.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, CardModule, ProgressSpinnerModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly statistics = signal<PlatformStatistics | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // Check if user is admin
    if (this.authState.role() !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }

    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getPlatformStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load platform statistics:', err);
        this.error.set('Не удалось загрузить статистику платформы');
        this.loading.set(false);
      },
    });
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToCourses(): void {
    this.router.navigate(['/admin/courses']);
  }
}
