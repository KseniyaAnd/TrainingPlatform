import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card';
import { Course } from '../../models/course.model';
import { CoursesService } from '../../services/courses/courses.service';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './courses.html',
})
export class CoursesPage {
  private readonly coursesService = inject(CoursesService);

  items: Course[] = [];
  loading = false;
  error: string | null = null;
  nextCursor: string | null = null;

  constructor() {
    void this.loadFirstPage();
  }

  loadMore(): void {
    if (!this.nextCursor || this.loading) return;
    void this.loadPage(this.nextCursor);
  }

  private loadFirstPage(): void {
    this.items = [];
    this.nextCursor = null;
    this.error = null;
    void this.loadPage(null);
  }

  private async loadPage(cursor: string | null): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const response = await firstValueFrom(this.coursesService.getCourses({ limit: 20, cursor }));

      if (!response) return;

      this.items = cursor ? [...this.items, ...response.items] : response.items;
      this.nextCursor = response.page?.nextCursor ?? null;
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Failed to load courses';
    } finally {
      this.loading = false;
    }
  }
}
