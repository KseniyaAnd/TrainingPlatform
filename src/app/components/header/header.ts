import { Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { firstValueFrom } from 'rxjs';

import { Course } from '../../models/course.model';
import { AuthStateService } from '../../services/auth/auth-state.service';
import { AuthService } from '../../services/auth/auth.service';
import { CoursesService } from '../../services/courses/courses.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './header.html',
})
export class HeaderComponent implements OnDestroy {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly suggestions = signal<Course[]>([]);
  readonly showSuggestions = signal(false);

  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly username = this.authState.username;
  readonly role = this.authState.role;
  readonly isAdmin = computed(() => this.role() === 'ADMIN');

  readonly hasSuggestions = computed(
    () => this.showSuggestions() && this.search().trim().length > 0,
  );

  private debounceHandle: ReturnType<typeof setTimeout> | null = null;
  private requestSeq = 0;

  constructor() {
    effect(() => {
      const q = this.search().trim();

      if (this.debounceHandle) {
        clearTimeout(this.debounceHandle);
        this.debounceHandle = null;
      }

      if (!q) {
        this.suggestions.set([]);
        return;
      }

      const seq = ++this.requestSeq;
      this.debounceHandle = setTimeout(() => void this.loadSuggestions(q, seq), 250);
    });
  }

  ngOnDestroy(): void {
    if (this.debounceHandle) clearTimeout(this.debounceHandle);
  }

  onSearchInput(value: string): void {
    this.search.set(value);
    this.showSuggestions.set(true);
  }

  onFocus(): void {
    this.showSuggestions.set(true);
  }

  closeSuggestions(): void {
    this.resetSearch();
  }

  openCourse(course: Course): void {
    this.resetSearch();
    void this.router.navigate(['/courses', course.id]);
  }

  openAllResults(): void {
    const q = this.search().trim();
    if (!q) return;
    this.resetSearch();
    void this.router.navigate(['/courses'], { queryParams: { q } });
  }

  onExplore(): void {
    this.resetSearch();
    void this.router.navigate([this.isAuthenticated() ? '/courses' : '/login']);
  }

  logout(): void {
    this.authService.logout();
  }

  private async loadSuggestions(q: string, seq: number): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.coursesService.getCourses({ limit: 50, cursor: null, q }),
      );
      if (seq !== this.requestSeq) return;

      const lower = q.toLowerCase();
      const items = (response?.items ?? [])
        .filter((c) => c.title?.toLowerCase().includes(lower))
        .slice(0, 4);

      this.suggestions.set(items);
    } catch {
      if (seq === this.requestSeq) this.suggestions.set([]);
    }
  }

  private resetSearch(): void {
    this.search.set('');
    this.showSuggestions.set(false);
    this.suggestions.set([]);
  }
}
