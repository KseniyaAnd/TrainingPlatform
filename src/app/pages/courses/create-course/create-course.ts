import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

import { Course } from '../../../models/course.model';
import { CoursesService } from '../../../services/courses/courses.service';
import { ButtonComponent } from '../../../shared/components/ui/button/button';

@Component({
  selector: 'app-create-course-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, InputTextModule, MultiSelectModule, ButtonComponent],
  templateUrl: './create-course.html',
})
export class CreateCoursePage {
  private readonly fb = inject(FormBuilder);
  private readonly coursesService = inject(CoursesService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly tagOptions: Array<{ label: string; value: string }> = [
    { label: 'Дизайн', value: 'дизайн' },
    { label: 'Фронтенд', value: 'фронтенд' },
    { label: 'Бэкенд', value: 'бэкенд' },
    { label: 'Машинное обучение', value: 'машинное обучение' },
    { label: 'DevOps', value: 'DevOps' },
    { label: 'Мобильная разработка', value: 'Мобильная разработка' },
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    tags: this.fb.nonNullable.control<string[]>([]),
  });

  // Сигналы для отслеживания touched состояния
  readonly titleTouched = signal(false);
  readonly descriptionTouched = signal(false);

  // Преобразуем значения формы в сигналы
  readonly titleValue = toSignal(this.form.controls.title.valueChanges, {
    initialValue: this.form.controls.title.value,
  });
  readonly descriptionValue = toSignal(this.form.controls.description.valueChanges, {
    initialValue: this.form.controls.description.value,
  });

  // Computed сигналы для ошибок
  readonly titleError = computed(() => {
    if (!this.titleTouched()) return null;
    const control = this.form.controls.title;
    // Триггерим пересчет при изменении значения
    this.titleValue();
    if (control.valid) return null;
    return 'Название обязательно (минимум 3 символа)';
  });

  readonly descriptionError = computed(() => {
    if (!this.descriptionTouched()) return null;
    const control = this.form.controls.description;
    // Триггерим пересчет при изменении значения
    this.descriptionValue();
    if (control.valid) return null;
    return 'Описание обязательно (минимум 3 символа)';
  });

  onTitleBlur(): void {
    this.titleTouched.set(true);
  }

  onDescriptionBlur(): void {
    this.descriptionTouched.set(true);
  }

  submit(): void {
    this.submitError.set(null);
    this.titleTouched.set(true);
    this.descriptionTouched.set(true);

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
