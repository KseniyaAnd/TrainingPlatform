import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card';
import { CourseWithEnrollment } from '../../models/course.model';
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

  readonly items = signal<CourseWithEnrollment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly nextCursor = signal<string | null>(null);
  private readonly scope = signal<string | null>(null);
  private readonly tag = signal<string | null>(null);
  private readonly q = signal<string | null>(null);

  readonly isMyCoursesScope = computed(() => this.scope() === 'me');
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly isTeacher = computed(() => this.authState.role() === 'TEACHER');
  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');
  readonly filteredItems = computed(() => {
    const tag = this.tag();
    const q = (this.q() ?? '').trim().toLowerCase();
    const items = this.items();
    let next = items;

    if (tag) {
      next = next.filter((c) => (c.tags ?? []).includes(tag));
    }

    if (q) {
      next = next.filter((c) => (c.title ?? '').toLowerCase().includes(q));
    }

    return next;
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.scope.set(params.get('scope'));
      this.tag.set(params.get('tag'));
      this.q.set(params.get('q'));
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
      const isAuthenticated = this.isAuthenticated();

      // Redirect to login if trying to access "my courses" without authentication
      if (scope === 'me' && !isAuthenticated) {
        this.error.set('Необходимо войти в систему для просмотра своих курсов');
        return;
      }

      if (scope === 'me' && isAuthenticated) {
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
        // Load all courses - available for everyone (authenticated and non-authenticated)
        if (isAuthenticated && role === 'STUDENT' && !cursor) {
          // For authenticated students, load with enrollment status
          const coursesWithEnrollment = await firstValueFrom(
            this.coursesService.loadCoursesWithEnrollmentStatus({ limit: 20, cursor, q }),
          );
          this.items.set(coursesWithEnrollment);
          this.nextCursor.set(null); // For simplicity, disable pagination when using combined load
        } else {
          // For non-authenticated users or teachers, just load courses
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
