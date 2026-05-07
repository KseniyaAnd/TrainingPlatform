import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { StatisticCardComponent } from '../../../components/statistic-card/statistic-card';
import { PlatformStatistics } from '../../../models/analytics.model';
import { AdminService } from '../../../services/admin/admin.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button';
import { LoadingStateComponent } from '../../../shared/components/ui/loading-state/loading-state';
import { handleLoadError } from '../../../shared/utils/error-handler.utils';
import {
  createLoadingState,
  resetLoadingState,
  setLoadingError,
  setLoadingSuccess,
} from '../../../shared/utils/loading-state';

interface StatisticCardData {
  icon: string;
  value: number;
  label: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ButtonComponent, LoadingStateComponent, StatisticCardComponent],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  private readonly state = createLoadingState<PlatformStatistics>();
  readonly platformStats = this.state.data;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  readonly statisticsCards = computed<StatisticCardData[]>(() => {
    const stats = this.platformStats();
    if (!stats) return [];

    return [
      {
        icon: 'pi-users',
        value: stats.usersCount,
        label: 'Пользователей',
      },
      {
        icon: 'pi-book',
        value: stats.coursesCount,
        label: 'Курсов',
      },
      {
        icon: 'pi-user-plus',
        value: stats.enrollmentsCount,
        label: 'Записей на курсы',
      },
      {
        icon: 'pi-star',
        value: stats.averageSubmissionScore,
        label: 'Средний балл',
      },
    ];
  });

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    resetLoadingState(this.state);

    this.adminService.getPlatformStatistics().subscribe({
      next: (stats) => {
        setLoadingSuccess(this.state, stats);
      },
      error: (err) => {
        const errorMessage = handleLoadError(err, 'platform statistics');
        setLoadingError(this.state, errorMessage);
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
