import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CourseCardComponent } from '../../../components/course-card/course-card';
import { Course } from '../../../models/course.model';
import { CoursesService } from '../../../services/courses/courses.service';

@Component({
  selector: 'app-my-learning-courses-page',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './my-learning-courses.html',
})
export class MyLearningCoursesPage {
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  readonly items = signal<Course[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);

  constructor() {
    void this.loadFirstPage();
  }

  openCourse(course: Course): void {
    void this.router.navigate(['/courses', course.id]);
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

    this.coursesService.getCourses({ limit: 20, cursor }).subscribe({
      next: (response) => {
        this.items.set(cursor ? [...this.items(), ...response.items] : response.items);
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
