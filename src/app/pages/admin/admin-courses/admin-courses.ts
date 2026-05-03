import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { Course } from '../../../models/course.model';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { CoursesService } from '../../../services/courses/courses.service';

@Component({
  selector: 'app-admin-courses',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css',
})
export class AdminCoursesComponent implements OnInit {
  private readonly coursesService = inject(CoursesService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly courses = signal<Course[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  readonly loadingMore = signal(false);
  readonly deletingCourseId = signal<string | null>(null);

  readonly isAdmin = computed(() => this.authState.role() === 'ADMIN');

  ngOnInit(): void {
    // Check if user is admin
    if (!this.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);

    this.coursesService.getCourses({ limit: 50 }).subscribe({
      next: (response) => {
        this.courses.set(response.items);
        this.nextCursor.set(response.page.nextCursor ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.error.set('Не удалось загрузить список курсов');
        this.loading.set(false);
      },
    });
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loadingMore()) return;

    this.loadingMore.set(true);

    this.coursesService.getCourses({ limit: 50, cursor }).subscribe({
      next: (response) => {
        this.courses.set([...this.courses(), ...response.items]);
        this.nextCursor.set(response.page.nextCursor ?? null);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error('Failed to load more courses:', err);
        this.loadingMore.set(false);
      },
    });
  }

  viewCourse(courseId: string): void {
    this.router.navigate(['/courses', courseId]);
  }

  editCourse(courseId: string): void {
    this.router.navigate(['/courses', courseId, 'edit']);
  }

  confirmDelete(course: Course): void {
    this.confirmationService.confirm({
      message: `Вы уверены, что хотите удалить курс "${course.title}"?`,
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Да, удалить',
      rejectLabel: 'Отмена',
      accept: () => {
        this.deleteCourse(course.id);
      },
    });
  }

  deleteCourse(courseId: string): void {
    this.deletingCourseId.set(courseId);

    this.coursesService.deleteCourse(courseId).subscribe({
      next: () => {
        this.courses.set(this.courses().filter((c) => c.id !== courseId));
        this.deletingCourseId.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Курс удалён',
        });
      },
      error: (err) => {
        console.error('Failed to delete course:', err);
        this.deletingCourseId.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось удалить курс',
        });
      },
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Н/Д';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
