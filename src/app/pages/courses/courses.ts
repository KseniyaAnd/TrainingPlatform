import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card';
import { Course } from '../../models/course.model';
import { AuthStateService } from '../../services/auth/auth-state.service';
import { CoursesService } from '../../services/courses/courses.service';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  templateUrl: './courses.html',
})
export class CoursesPage {
  private readonly coursesService = inject(CoursesService);
  private readonly route = inject(ActivatedRoute);
  private readonly authState = inject(AuthStateService);

  readonly items = signal<Course[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  private readonly scope = signal<string | null>(null);

  readonly isMyCoursesScope = computed(() => this.scope() === 'me');
  readonly isTeacher = computed(() => this.authState.role() === 'TEACHER');

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.scope.set(params.get('scope'));
    });

    effect(() => {
      this.scope();
      void this.loadFirstPage();
    });
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loading()) return;
    void this.loadPage(cursor);
  }

  private loadFirstPage(): void {
    this.items.set([]);
    this.nextCursor.set(null);
    this.error.set(null);
    void this.loadPage(null);
  }

  private async loadPage(cursor: string | null): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.scope() === 'me'
          ? this.coursesService.getMyCourses({ limit: 20, cursor })
          : this.coursesService.getCourses({ limit: 20, cursor }),
      );

      if (!response) return;

      this.items.set(cursor ? [...this.items(), ...response.items] : response.items);
      this.nextCursor.set(response.page?.nextCursor ?? null);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to load courses');
    } finally {
      this.loading.set(false);
    }
  }
}
