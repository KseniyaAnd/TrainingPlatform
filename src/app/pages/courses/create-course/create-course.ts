import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

import { Course } from '../../../models/course.model';
import { CoursesService } from '../../../services/courses/courses.service';

@Component({
  selector: 'app-create-course-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
  ],
  templateUrl: './create-course.html',
})
export class CreateCoursePage {
  private readonly fb = inject(FormBuilder);
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly tagOptions: Array<{ label: string; value: string }> = [
    { label: 'дизайн', value: 'дизайн' },
    { label: 'фронтенд', value: 'фронтенд' },
    { label: 'бэкенд', value: 'бэкенд' },
    { label: 'машинное обучение', value: 'машинное обучение' },
    { label: 'DevOps', value: 'DevOps' },
    { label: 'Мобильная разработка', value: 'Мобильная разработка' },
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    tags: this.fb.nonNullable.control<string[]>([]),
  });

  submit(): void {
    this.submitError.set(null);
    if (this.form.invalid) return;
    if (this.loading()) return;

    this.loading.set(true);
    this.coursesService
      .createCourse({
        title: this.form.controls.title.value,
        description: this.form.controls.description.value,
        tags: this.form.controls.tags.value,
      })
      .subscribe({
        next: (course: Course) => {
          this.loading.set(false);
          this.router.navigateByUrl(`/courses/${course.id}`);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          const errorObj = err as {
            error?: { message?: unknown; error?: unknown };
            message?: unknown;
          };
          const message =
            (errorObj?.error && (errorObj.error.message || errorObj.error.error)) ||
            errorObj?.message ||
            'Failed to create course';
          this.submitError.set(String(message));
        },
      });
  }
}
