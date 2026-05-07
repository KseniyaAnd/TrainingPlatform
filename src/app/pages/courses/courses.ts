import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CourseCardComponent } from '../../components/course-card/course-card.js';
import {
  CourseFilters,
  CourseFiltersComponent,
} from '../../components/course-filters/course-filters.js';
import { CoursesService } from '../../services/courses/courses.service.js';
import { ButtonComponent } from '../../shared/components/ui/button/button.js';
import { EmptyStateComponent } from '../../shared/components/ui/empty-state/empty-state.js';
import { CoursesEmptyStateService } from './services/courses-empty-state.service.js';
import { CoursesFilterService } from './services/courses-filter.service.js';
import { CoursesPageStateService } from './services/courses-page-state.service.js';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [
    RouterLink,
    CourseCardComponent,
    CourseFiltersComponent,
    EmptyStateComponent,
    ButtonComponent,
  ],
  providers: [CoursesFilterService, CoursesPageStateService, CoursesEmptyStateService],
  templateUrl: './courses.html',
})
export class CoursesPage {
  private readonly coursesService = inject(CoursesService);
  private readonly filterService = inject(CoursesFilterService);
  private readonly pageState = inject(CoursesPageStateService);
  private readonly emptyStateService = inject(CoursesEmptyStateService);
  readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = this.pageState.loading;
  readonly error = this.pageState.error;
  readonly nextCursor = this.pageState.nextCursor;
  readonly isMyCoursesScope = this.pageState.isMyCoursesScope;
  readonly isTeacher = this.pageState.isTeacher;
  readonly isStudent = this.pageState.isStudent;

  // Empty state computed properties
  readonly emptyState = computed(() =>
    this.emptyStateService.getEmptyState(this.isMyCoursesScope()),
  );
  readonly emptyStateTitle = computed(() => this.emptyState().title);
  readonly emptyStateMessage = computed(() => this.emptyState().message);
  readonly emptyStateActionLabel = computed(() => this.emptyState().actionLabel);
  readonly emptyStateActionLink = computed(() => this.emptyState().actionLink);

  // Use filter service for filtering and sorting
  readonly filteredItems = this.filterService.filteredCourses;
  readonly selectedSort = computed(() => this.filterService.getCurrentSort());
  readonly tag = computed(() => this.filterService.getCurrentTag());

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
      const scope = params.get('scope');
      const q = params.get('q');

      // Update filter service with URL params
      const tag = params.get('tag');
      const sortByParam = params.get('sortBy');
      const sortBy = sortByParam === 'date' || sortByParam === 'title' ? sortByParam : null;

      this.filterService.updateFilters({ tag, sortBy });

      // Load courses when scope or query changes
      void this.pageState.loadFirstPage(scope, q, (courses, nextCursor) => {
        this.filterService.setCourses(courses);
      });
    });
  }

  loadMore(): void {
    void this.pageState.loadMore((courses, nextCursor) => {
      const currentCourses = this.filterService['allCourses']();
      this.filterService.setCourses([...currentCourses, ...courses]);
    });
  }

  async handleEnroll(courseId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.coursesService.enroll(courseId));

      // Update the course in the filter service
      const currentCourses = this.filterService['allCourses']();
      const updatedCourses = currentCourses.map((course) =>
        course.id === courseId
          ? { ...course, isEnrolled: true, enrollmentId: response.enrollmentId }
          : course,
      );
      this.filterService.setCourses(updatedCourses);
    } catch (e) {
      console.error('Failed to enroll:', e);
      // Optionally show error to user
    }
  }

  async handleUnenroll(enrollmentId: string, courseId: string): Promise<void> {
    try {
      await firstValueFrom(this.coursesService.unenroll(enrollmentId));

      // Update the course in the filter service
      const currentCourses = this.filterService['allCourses']();
      const updatedCourses = currentCourses.map((course) =>
        course.id === courseId ? { ...course, isEnrolled: false, enrollmentId: null } : course,
      );
      this.filterService.setCourses(updatedCourses);
    } catch (e) {
      console.error('Failed to unenroll:', e);
      // Optionally show error to user
    }
  }

  onFiltersChange(filters: CourseFilters): void {
    // Update filter service
    this.filterService.updateFilters(filters);

    // Update URL params
    const currentParams = this.route.snapshot.queryParamMap;
    const queryParams: Record<string, string | null> = {};

    if (currentParams.has('scope')) {
      queryParams['scope'] = currentParams.get('scope');
    }
    if (currentParams.has('q')) {
      queryParams['q'] = currentParams.get('q');
    }

    // Set tag and sortBy from filters
    queryParams['tag'] = filters.tag;
    queryParams['sortBy'] = filters.sortBy;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }
}
