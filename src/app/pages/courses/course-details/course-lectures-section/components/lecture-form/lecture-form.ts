import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { LessonWithLectures } from '../../../course-lessons-section/course-lessons-section';
import { LectureFormService } from '../../services/lecture-form.service';

@Component({
  selector: 'app-lecture-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './lecture-form.html',
})
export class LectureFormComponent {
  readonly formService = inject(LectureFormService);
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly onSubmit = output<void>();
}
