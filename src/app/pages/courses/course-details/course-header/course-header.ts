import { DatePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Course } from '../../../../models/course.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';

@Component({
  selector: 'app-course-header',
  standalone: true,
  imports: [DatePipe, RouterModule, ReactiveFormsModule, ButtonComponent],
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

  readonly isTeacher = () => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  };
  readonly canEditCourse = () => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  };
}
