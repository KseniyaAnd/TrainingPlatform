import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { User } from '../../../models/user.model';
import { AdminService, UsersListParams } from '../../../services/admin/admin.service';

type RoleFilter = 'ALL' | 'ADMIN' | 'TEACHER' | 'STUDENT';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ButtonModule, MessageModule, TableModule, TagModule],
  templateUrl: './admin-users.html',
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedRole = signal<RoleFilter>('ALL');

  readonly roleFilters: Array<{ label: string; value: RoleFilter }> = [
    { label: 'Все', value: 'ALL' },
    { label: 'Администраторы', value: 'ADMIN' },
    { label: 'Преподаватели', value: 'TEACHER' },
    { label: 'Студенты', value: 'STUDENT' },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: UsersListParams = {
      limit: 100,
    };

    const role = this.selectedRole();
    if (role !== 'ALL') {
      params.role = role;
    }

    this.adminService.getUsers(params).subscribe({
      next: (response) => {
        this.users.set(response.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.error.set('Не удалось загрузить список пользователей');
        this.loading.set(false);
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

  getRoleSeverity(role: string): 'warn' | 'info' | 'success' | 'secondary' {
    switch (role) {
      case 'ADMIN':
        return 'warn';
      case 'TEACHER':
        return 'info';
      case 'STUDENT':
        return 'success';
      default:
        return 'secondary';
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
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goBack(): void {
    void this.router.navigate(['/admin']);
  }
}
