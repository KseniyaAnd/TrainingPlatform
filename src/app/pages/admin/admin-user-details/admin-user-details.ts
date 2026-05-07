import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { BackButtonComponent } from '../../../components/back-button/back-button';
import { UserDetails } from '../../../models/analytics.model';
import { AdminService } from '../../../services/admin/admin.service';
import { UserAnalyticsService } from '../../../services/analytics/user-analytics.service';
import { LoadingStateComponent } from '../../../shared/components/ui/loading-state/loading-state';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { handleLoadError } from '../../../shared/utils/error-handler.utils';
import {
  createLoadingState,
  resetLoadingState,
  setLoadingError,
  setLoadingSuccess,
} from '../../../shared/utils/loading-state';
import { getRoleLabel, getRoleSeverity } from '../../../shared/utils/role.utils';

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [TableModule, TagModule, BackButtonComponent, LoadingStateComponent, FormatDatePipe],
  templateUrl: './admin-user-details.html',
})
export class AdminUserDetailsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly analyticsService = inject(UserAnalyticsService);

  private readonly state = createLoadingState<UserDetails>();
  readonly userDetails = this.state.data;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  // Expose utility functions for template
  readonly getRoleSeverity = getRoleSeverity;
  readonly getRoleLabel = getRoleLabel;
  readonly getScoreSeverity = this.analyticsService.getScoreSeverity;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadUserDetails(userId);
    } else {
      setLoadingError(this.state, 'ID пользователя не указан');
    }
  }

  loadUserDetails(userId?: string): void {
    const id = userId || this.route.snapshot.paramMap.get('userId');
    if (!id) return;

    resetLoadingState(this.state);

    this.adminService.getUserDetails(id).subscribe({
      next: (details) => {
        // Обогащаем данные через сервис
        const enrichedDetails = this.analyticsService.enrichUserDetails(details);
        setLoadingSuccess(this.state, enrichedDetails);
      },
      error: (err) => {
        const errorMessage = handleLoadError(err, 'user details');
        setLoadingError(this.state, errorMessage);
      },
    });
  }

  /**
   * Получить средний балл студента по всем оценкам
   */
  getAverageScore(): string {
    return this.analyticsService.calculateAverageScore(this.userDetails());
  }
}
