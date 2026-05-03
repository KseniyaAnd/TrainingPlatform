import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

import { UserDetails } from '../../../models/analytics.model';
import { AdminService } from '../../../services/admin/admin.service';
import { AuthStateService } from '../../../services/auth/auth-state.service';

@Component({
  selector: 'app-admin-user-details',
  imports: [CommonModule, CardModule, TableModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './admin-user-details.html',
  styleUrl: './admin-user-details.css',
})
export class AdminUserDetailsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authState = inject(AuthStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly userDetails = signal<UserDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // Check if user is admin
    if (this.authState.role() !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }

    const userId = this.route.snapshot.paramMap.get('userId');
    if (!userId) {
      this.router.navigate(['/admin/users']);
      return;
    }

    this.loadUserDetails(userId);
  }

  private loadUserDetails(userId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getUserDetails(userId).subscribe({
      next: (details) => {
        this.userDetails.set(details);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load user details:', err);
        this.error.set('Не удалось загрузить детали пользователя');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatProgress(progress: number): string {
    return `${Math.round(progress * 100)}%`;
  }

  navigateToCourse(courseId: string): void {
    this.router.navigate(['/courses', courseId]);
  }
}
