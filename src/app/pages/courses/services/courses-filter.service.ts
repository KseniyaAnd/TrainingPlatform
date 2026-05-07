import { Injectable, computed, signal } from '@angular/core';
import { CourseWithEnrollment } from '../../../models/course.model';

export interface CourseFilters {
  tag: string | null;
  sortBy: 'date' | 'title' | null;
  searchQuery: string | null;
}

@Injectable()
export class CoursesFilterService {
  // State
  private readonly allCourses = signal<CourseWithEnrollment[]>([]);
  private readonly filters = signal<CourseFilters>({
    tag: null,
    sortBy: null,
    searchQuery: null,
  });

  // Computed
  readonly filteredCourses = computed(() => {
    let courses = this.allCourses();
    const { tag, sortBy, searchQuery } = this.filters();

    // Filter by tag
    if (tag) {
      const tagLower = tag.toLowerCase();
      courses = courses.filter((c) => (c.tags ?? []).some((t) => t.toLowerCase() === tagLower));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(
        (c) =>
          (c.title ?? '').toLowerCase().includes(query) ||
          (c.description ?? '').toLowerCase().includes(query),
      );
    }

    // Sort
    if (sortBy === 'title') {
      courses = [...courses].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
    } else if (sortBy === 'date') {
      courses = [...courses].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return courses;
  });

  // Methods
  setCourses(courses: CourseWithEnrollment[]): void {
    this.allCourses.set(courses);
  }

  updateFilters(filters: Partial<CourseFilters>): void {
    this.filters.update((current) => ({ ...current, ...filters }));
  }

  resetFilters(): void {
    this.filters.set({ tag: null, sortBy: null, searchQuery: null });
  }

  // Getters
  getFilters() {
    return this.filters();
  }

  getCurrentTag() {
    return this.filters().tag;
  }

  getCurrentSort() {
    return this.filters().sortBy;
  }
}
