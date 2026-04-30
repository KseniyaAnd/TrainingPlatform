import { Component, OnDestroy, effect, inject, signal } from '@angular/core';
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
  private readonly authStateService = inject(AuthStateService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly coursesService = inject(CoursesService);

  readonly search = signal('');
  readonly suggestions = signal<Course[]>([]);
  readonly showSuggestions = signal(false);

  private debounceHandle: ReturnType<typeof setTimeout> | null = null;
  private requestSeq = 0;

  readonly isAuthenticated = this.authStateService.isAuthenticated;
  readonly username = this.authStateService.username;
  readonly role = this.authStateService.role;

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

      const currentSeq = ++this.requestSeq;
      this.debounceHandle = setTimeout(() => {
        void this.loadSuggestions(q, currentSeq);
      }, 250);
    });
  }

  onSearchInput(value: string): void {
    this.showSuggestions.set(true);
    this.search.set(value);
  }

  private async loadSuggestions(q: string, seq: number): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.coursesService.getCourses({ limit: 50, cursor: null, q }),
      );

      if (seq !== this.requestSeq) return;

      const lower = q.toLowerCase();
      const items = (response?.items ?? [])
        .filter((c) => (c.title ?? '').toLowerCase().includes(lower))
        .slice(0, 4);

      this.suggestions.set(items);
    } catch {
      if (seq !== this.requestSeq) return;
      this.suggestions.set([]);
    }
  }

  openCourse(course: Course): void {
    this.clearSearch();
    void this.router.navigate(['/courses', course.id]);
  }

  closeSuggestions(): void {
    this.clearSearch();
  }

  openAllResults(): void {
    const q = this.search().trim();
    if (!q) return;
    this.showSuggestions.set(false);
    void this.router.navigate(['/courses'], { queryParams: { q } });
  }

  onExplore(): void {
    this.clearSearch();
    void this.router.navigate([this.isAuthenticated() ? '/courses' : '/login']);
  }

  private clearSearch(): void {
    this.search.set('');
    this.showSuggestions.set(false);
    this.suggestions.set([]);
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
      this.debounceHandle = null;
    }
  }
}
