import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { LessonWithLectures } from '../../../course-lessons-section/course-lessons-section';
import { LectureFormService } from '../../services/lecture-form.service';

@Component({
  selector: 'app-lecture-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './lecture-form.component.html',
})
export class LectureFormComponent {
  readonly formService = inject(LectureFormService);
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly onSubmit = output<void>();
}
