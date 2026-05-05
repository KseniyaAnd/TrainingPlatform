import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

import { PlatformStatistics } from '../../../models/analytics.model';
import { AdminService } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, MessageModule],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly statistics = signal<PlatformStatistics | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
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
    void this.router.navigate(['/admin/users']);
  }

  navigateToCourses(): void {
    void this.router.navigate(['/admin/courses']);
  }
}
