import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

import { BackButtonComponent } from '../../../components/back-button/back-button';
import { CourseCardComponent } from '../../../components/course-card/course-card';
import { Course } from '../../../models/course.model';
import { CoursesService } from '../../../services/courses/courses.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button';
import { LoadingStateComponent } from '../../../shared/components/ui/loading-state/loading-state';
import { handleLoadError } from '../../../shared/utils/error-handler.utils';
import {
  createLoadingState,
  resetLoadingState,
  setLoadingError,
  setLoadingSuccess,
} from '../../../shared/utils/loading-state';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    ButtonComponent,
    DialogModule,
    MessageModule,
    TooltipModule,
    CourseCardComponent,
    BackButtonComponent,
    LoadingStateComponent,
  ],
  templateUrl: './admin-courses.html',
})
export class AdminCoursesComponent implements OnInit {
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  private readonly state = createLoadingState<Course[]>([]);
  readonly courses = this.state.data;
  readonly loading = this.state.loading;
  readonly error = this.state.error;
  readonly deleteConfirmation = signal<Course | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    resetLoadingState(this.state);

    // Load all courses (admin can see all)
    this.coursesService.getCourses().subscribe({
      next: (response) => {
        setLoadingSuccess(this.state, response.items);
      },
      error: (err) => {
        const errorMessage = handleLoadError(err, 'courses');
        setLoadingError(this.state, errorMessage);
      },
    });
  }

  viewCourse(courseId: string): void {
    void this.router.navigate(['/courses', courseId]);
  }

  editCourse(courseId: string): void {
    void this.router.navigate(['/courses', courseId], { queryParams: { edit: 'true' } });
  }

  confirmDelete(course: Course): void {
    this.deleteConfirmation.set(course);
  }

  cancelDelete(): void {
    this.deleteConfirmation.set(null);
  }

  deleteCourse(): void {
    const course = this.deleteConfirmation();
    if (!course) return;

    this.deleting.set(true);

    this.coursesService.deleteCourse(course.id).subscribe({
      next: () => {
        // Remove from list
        const currentCourses = this.courses() || [];
        this.courses.set(currentCourses.filter((c) => c.id !== course.id));
        this.deleteConfirmation.set(null);
        this.deleting.set(false);
      },
      error: (err) => {
        console.error('Failed to delete course:', err);
        alert('Не удалось удалить курс. Попробуйте еще раз.');
        this.deleting.set(false);
      },
    });
  }
}
