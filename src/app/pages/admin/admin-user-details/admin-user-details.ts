import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

import { UserDetails } from '../../../models/analytics.model';
import { AdminService } from '../../../services/admin/admin.service';

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, MessageModule, ProgressBarModule, TagModule],
  templateUrl: './admin-user-details.html',
})
export class AdminUserDetailsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly userDetails = signal<UserDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadUserDetails(userId);
    } else {
      this.error.set('ID пользователя не указан');
      this.loading.set(false);
    }
  }

  loadUserDetails(userId?: string): void {
    const id = userId || this.route.snapshot.paramMap.get('userId');
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.adminService.getUserDetails(id).subscribe({
      next: (details) => {
        this.userDetails.set(details);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load user details:', err);
        this.error.set('Не удалось загрузить данные пользователя');
        this.loading.set(false);
      },
    });
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

  getScoreSeverity(score: number): 'success' | 'warn' | 'danger' {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warn';
    return 'danger';
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
    void this.router.navigate(['/admin/users']);
  }
}
