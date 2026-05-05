import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

import { CourseCardComponent } from '../../../components/course-card/course-card';
import { Course } from '../../../models/course.model';
import { CoursesService } from '../../../services/courses/courses.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    MessageModule,
    TooltipModule,
    CourseCardComponent,
  ],
  templateUrl: './admin-courses.html',
})
export class AdminCoursesComponent implements OnInit {
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  readonly courses = signal<Course[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly deleteConfirmation = signal<Course | null>(null);
  readonly deleting = signal(false);

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load all courses (admin can see all)
    this.coursesService.getCourses().subscribe({
      next: (response) => {
        this.courses.set(response.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.error.set('Не удалось загрузить список курсов');
        this.loading.set(false);
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
        this.courses.update((courses) => courses.filter((c) => c.id !== course.id));
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  goBack(): void {
    void this.router.navigate(['/admin']);
  }
}
