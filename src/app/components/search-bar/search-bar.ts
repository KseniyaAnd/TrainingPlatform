import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

import { Course } from '../../models/course.model';
import { CoursesService } from '../../services/courses/courses.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, InputTextModule],
  templateUrl: './search-bar.html',
})
export class SearchBarComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly search = signal('');
  readonly showSuggestions = signal(false);

  constructor() {
    // Initialize search from URL query parameter
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q');
      if (q) {
        this.search.set(q);
      } else if (this.search()) {
        // Clear search if no query parameter
        this.search.set('');
      }
    });
  }

  readonly suggestions = toSignal(
    toObservable(this.search).pipe(
      map((q) => q.trim()),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((q) => {
        if (!q) return of([]);
        return this.coursesService.getCourses({ limit: 50, cursor: null, q }).pipe(
          map((response) => {
            const lower = q.toLowerCase();
            return (response?.items ?? [])
              .filter((c) => c.title?.toLowerCase().includes(lower))
              .slice(0, 4);
          }),
          catchError(() => of([])),
        );
      }),
    ),
    { initialValue: [] as Course[] },
  );

  readonly hasSuggestions = computed(
    () => this.showSuggestions() && this.search().trim().length > 0,
  );

  onSearchInput(value: string): void {
    this.search.set(value);
    this.showSuggestions.set(true);
  }

  selectCourse(course: Course): void {
    this.search.set('');
    this.showSuggestions.set(false);
    void this.router.navigate(['/courses', course.id]);
  }

  showAllResults(): void {
    const q = this.search().trim();
    if (q) {
      this.showSuggestions.set(false);
      void this.router.navigate(['/courses'], { queryParams: { q } });
    }
  }
}
