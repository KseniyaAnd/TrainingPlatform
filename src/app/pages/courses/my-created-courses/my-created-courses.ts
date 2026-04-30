import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../../components/course-card/course-card';
import { Course } from '../../../models/course.model';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { CoursesService } from '../../../services/courses/courses.service';

@Component({
  selector: 'app-my-created-courses-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  templateUrl: './my-created-courses.html',
})
export class MyCreatedCoursesPage {
  private readonly coursesService = inject(CoursesService);
  private readonly authStateService = inject(AuthStateService);

  readonly items = signal<Course[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);

  constructor() {
    void this.loadFirstPage();
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loading()) return;
    this.loadPage(cursor);
  }

  private loadFirstPage(): void {
    this.items.set([]);
    this.nextCursor.set(null);
    this.error.set(null);
    this.loadPage(null);
  }

  private loadPage(cursor: string | null): void {
    this.loading.set(true);
    this.error.set(null);

    this.coursesService.getMyCourses({ limit: 20, cursor }).subscribe({
      next: (response) => {
        const teacherName = this.authStateService.username() ?? undefined;
        const nextItems = response.items.map((c) => ({ ...c, teacherName }));

        this.items.set(cursor ? [...this.items(), ...nextItems] : nextItems);
        this.nextCursor.set(response.page?.nextCursor ?? null);
        this.loading.set(false);
      },
      error: (e: unknown) => {
        this.error.set(e instanceof Error ? e.message : 'Failed to load courses');
        this.loading.set(false);
      },
    });
  }
}
