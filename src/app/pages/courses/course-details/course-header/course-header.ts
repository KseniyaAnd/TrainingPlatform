import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Course } from '../../../../models/course.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';

@Component({
  selector: 'app-course-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './course-header.html',
})
export class CourseHeaderComponent {
  readonly course = input.required<Course>();
  readonly subscribed = input.required<boolean>();
  readonly submitting = input.required<boolean>();
  readonly showCourseForm = input.required<boolean>();
  readonly courseForm = input.required<FormGroup>();
  readonly activeTab = input.required<'content' | 'analytics'>();

  readonly subscribe = output<void>();
  readonly unsubscribe = output<void>();
  readonly editCourse = output<void>();
  readonly deleteCourse = output<void>();
  readonly submitCourse = output<void>();
  readonly cancelForm = output<void>();
  readonly tabChange = output<'content' | 'analytics'>();

  private readonly authState = inject(AuthStateService);

  readonly isTeacher = () => this.authState.role() === 'TEACHER';
  readonly canEditCourse = () => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  };
}
