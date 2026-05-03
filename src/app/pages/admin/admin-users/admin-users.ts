import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

import { User } from '../../../models/user.model';
import { AdminService } from '../../../services/admin/admin.service';
import { AuthStateService } from '../../../services/auth/auth-state.service';

type RoleFilter = 'ALL' | 'ADMIN' | 'TEACHER' | 'STUDENT';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, TableModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedRole = signal<RoleFilter>('ALL');
  readonly nextCursor = signal<string | null>(null);
  readonly loadingMore = signal(false);

  readonly roleOptions = [
    { label: 'Все роли', value: 'ALL' as RoleFilter },
    { label: 'Администраторы', value: 'ADMIN' as RoleFilter },
    { label: 'Преподаватели', value: 'TEACHER' as RoleFilter },
    { label: 'Студенты', value: 'STUDENT' as RoleFilter },
  ];

  ngOnInit(): void {
    // Check if user is admin
    if (this.authState.role() !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }

    this.loadUsers();
  }

  setRole(role: RoleFilter): void {
    this.selectedRole.set(role);
    this.users.set([]);
    this.nextCursor.set(null);
    this.loadUsers();
  }

  onRoleChange(): void {
    this.users.set([]);
    this.nextCursor.set(null);
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const role = this.selectedRole();
    const params = {
      role: role === 'ALL' ? undefined : role,
      limit: 50,
    };

    this.adminService.getUsers(params).subscribe({
      next: (response) => {
        this.users.set(response.items);
        this.nextCursor.set(response.nextCursor);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.error.set('Не удалось загрузить список пользователей');
        this.loading.set(false);
      },
    });
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loadingMore()) return;

    this.loadingMore.set(true);

    const role = this.selectedRole();
    const params = {
      role: role === 'ALL' ? undefined : role,
      limit: 50,
      cursor,
    };

    this.adminService.getUsers(params).subscribe({
      next: (response) => {
        this.users.set([...this.users(), ...response.items]);
        this.nextCursor.set(response.nextCursor);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error('Failed to load more users:', err);
        this.loadingMore.set(false);
      },
    });
  }

  viewUserDetails(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'role-badge role-admin';
      case 'TEACHER':
        return 'role-badge role-teacher';
      case 'STUDENT':
        return 'role-badge role-student';
      default:
        return 'role-badge';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'TEACHER':
        return 'Преподаватель';
      case 'STUDENT':
        return 'Студент';
      default:
        return role;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
