import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { BackButtonComponent } from '../../../components/back-button/back-button';
import { User } from '../../../models/user.model';
import { AdminService, UsersListParams } from '../../../services/admin/admin.service';
import {
  RoleFilter,
  RoleFilterComponent,
} from '../../../shared/components/role-filter/role-filter';
import { ButtonComponent } from '../../../shared/components/ui/button/button';
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
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    TableModule,
    TagModule,
    BackButtonComponent,
    LoadingStateComponent,
    RoleFilterComponent,
    ButtonComponent,
    FormatDatePipe,
  ],
  templateUrl: './admin-users.html',
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  private readonly state = createLoadingState<User[]>([]);
  readonly users = this.state.data;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly selectedRole = signal<RoleFilter>('ALL');

  // Expose utility functions for template
  readonly getRoleSeverity = getRoleSeverity;
  readonly getRoleLabel = getRoleLabel;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    resetLoadingState(this.state);

    const params: UsersListParams = {
      limit: 100,
    };

    const role = this.selectedRole();
    if (role !== 'ALL') {
      params.role = role;
    }

    this.adminService.getUsers(params).subscribe({
      next: (response) => {
        setLoadingSuccess(this.state, response.items);
      },
      error: (err) => {
        const errorMessage = handleLoadError(err, 'users');
        setLoadingError(this.state, errorMessage);
      },
    });
  }

  filterByRole(role: RoleFilter): void {
    this.selectedRole.set(role);
    this.loadUsers();
  }

  viewUserDetails(userId: string): void {
    void this.router.navigate(['/admin/users', userId]);
  }
}
