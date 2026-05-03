import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card';
import {
  CourseFilters,
  CourseFiltersComponent,
} from '../../components/course-filters/course-filters';
import { CourseWithEnrollment } from '../../models/course.model';
import { AuthStateService } from '../../services/auth/auth-state.service';
import { CoursesService } from '../../services/courses/courses.service';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent, CourseFiltersComponent],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'],
})
export class CoursesPage {
  private readonly coursesService = inject(CoursesService);
  readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);

  readonly items = signal<CourseWithEnrollment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  private readonly scope = signal<string | null>(null);
  readonly tag = signal<string | null>(null);
  private readonly q = signal<string | null>(null);
  private readonly sortBy = signal<'date' | 'title' | null>(null);

  readonly isMyCoursesScope = computed(() => this.scope() === 'me');
  readonly isTeacher = computed(() => this.authState.role() === 'TEACHER');
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');
  readonly selectedSort = computed(() => this.sortBy());
  readonly filteredItems = computed(() => {
    const tag = this.tag();
    const q = (this.q() ?? '').trim().toLowerCase();
    const sortBy = this.sortBy();
    let items = this.items();

    // Фильтрация по тегу
    if (tag) {
      items = items.filter((c) => (c.tags ?? []).includes(tag));
    }

    // Фильтрация по поиску
    if (q) {
      items = items.filter((c) => (c.title ?? '').toLowerCase().includes(q));
    }

    // Сортировка
    if (sortBy === 'title') {
      items = [...items].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    } else if (sortBy === 'date') {
      items = [...items].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return items;
  });

  constructor() {
    // Handle legacy routes - redirect to new format with query params
    const redirectToScope = this.route.snapshot.data['redirectToScope'];
    if (redirectToScope) {
      void this.router.navigate(['/courses'], {
        queryParams: { scope: redirectToScope },
        replaceUrl: true,
      });
      return;
    }

    this.route.queryParamMap.subscribe((params) => {
      this.scope.set(params.get('scope'));
      this.tag.set(params.get('tag'));
      this.q.set(params.get('q'));

      const sortByParam = params.get('sortBy');
      this.sortBy.set(sortByParam === 'date' || sortByParam === 'title' ? sortByParam : null);
    });

    effect(() => {
      this.scope();
      this.tag();
      this.q();
      void this.loadFirstPage();
    });
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    if (!cursor || this.loading()) return;
    void this.loadPage(cursor);
  }

  async handleEnroll(courseId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.coursesService.enroll(courseId));

      // Update the course in the list
      this.items.update((items) =>
        items.map((course) =>
          course.id === courseId
            ? { ...course, isEnrolled: true, enrollmentId: response.enrollmentId }
            : course,
        ),
      );
    } catch (e) {
      console.error('Failed to enroll:', e);
      // Optionally show error to user
    }
  }

  async handleUnenroll(enrollmentId: string, courseId: string): Promise<void> {
    try {
      await firstValueFrom(this.coursesService.unenroll(enrollmentId));

      // Update the course in the list
      this.items.update((items) =>
        items.map((course) =>
          course.id === courseId ? { ...course, isEnrolled: false, enrollmentId: null } : course,
        ),
      );
    } catch (e) {
      console.error('Failed to unenroll:', e);
      // Optionally show error to user
    }
  }

  onFiltersChange(filters: CourseFilters): void {
    const queryParams: Record<string, string | null> = {
      tag: filters.tag,
      sortBy: filters.sortBy,
    };

    // Сохраняем существующие параметры
    const currentParams = this.route.snapshot.queryParamMap;
    if (currentParams.has('scope')) {
      queryParams['scope'] = currentParams.get('scope');
    }
    if (currentParams.has('q')) {
      queryParams['q'] = currentParams.get('q');
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
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
      const q = this.q();
      const role = this.authState.role();
      const scope = this.scope();

      if (scope === 'me') {
        // Load user's own courses (enrolled for students, created for teachers)
        if (role === 'STUDENT') {
          const response = await firstValueFrom(
            this.coursesService.getEnrolledCourses({ limit: 20, cursor, q }),
          );
          const coursesWithEnrollment: CourseWithEnrollment[] = response.items.map(
            (enrollment) => ({
              ...enrollment.course,
              isEnrolled: true,
              enrollmentId: enrollment.enrollmentId,
            }),
          );
          this.items.set(
            cursor ? [...this.items(), ...coursesWithEnrollment] : coursesWithEnrollment,
          );
          this.nextCursor.set(response.page?.nextCursor ?? null);
        } else {
          const response = await firstValueFrom(
            this.coursesService.getMyCourses({ limit: 20, cursor, q }),
          );
          const coursesWithEnrollment: CourseWithEnrollment[] = response.items.map((course) => ({
            ...course,
            isEnrolled: false,
            enrollmentId: null,
          }));
          this.items.set(
            cursor ? [...this.items(), ...coursesWithEnrollment] : coursesWithEnrollment,
          );
          this.nextCursor.set(response.page?.nextCursor ?? null);
        }
      } else {
        // Load all courses with enrollment status for students
        if (role === 'STUDENT' && !cursor) {
          const coursesWithEnrollment = await firstValueFrom(
            this.coursesService.loadCoursesWithEnrollmentStatus({ limit: 20, cursor, q }),
          );
          this.items.set(coursesWithEnrollment);
          this.nextCursor.set(null); // For simplicity, disable pagination when using combined load
        } else {
          const response = await firstValueFrom(
            this.coursesService.getCourses({ limit: 20, cursor, q }),
          );
          const coursesWithEnrollment: CourseWithEnrollment[] = response.items.map((course) => ({
            ...course,
            isEnrolled: false,
            enrollmentId: null,
          }));
          this.items.set(
            cursor ? [...this.items(), ...coursesWithEnrollment] : coursesWithEnrollment,
          );
          this.nextCursor.set(response.page?.nextCursor ?? null);
        }
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to load courses');
    } finally {
      this.loading.set(false);
    }
  }
}
