import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { firstValueFrom } from 'rxjs';
import { Banner } from '../../components/banner/banner';
import { CourseCardComponent } from '../../components/course-card/course-card';
import { Course } from '../../models/course.model';
import { CoursesService } from '../../services/courses/courses.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, Banner, CourseCardComponent],
  templateUrl: './home.html',
})
export class HomePageComponent {
  private readonly coursesService = inject(CoursesService);

  readonly backendTag = 'бэкенд';
  readonly designTag = 'дизайн';

  readonly backendCourses = signal<Course[]>([]);
  readonly designCourses = signal<Course[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.coursesService.getCourses({ limit: 50, cursor: null }),
      );
      const items = response?.items ?? [];

      this.backendCourses.set(
        items.filter((c) => (c.tags ?? []).includes(this.backendTag)).slice(0, 4),
      );
      this.designCourses.set(
        items.filter((c) => (c.tags ?? []).includes(this.designTag)).slice(0, 4),
      );
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to load courses');
    } finally {
      this.loading.set(false);
    }
  }
}
