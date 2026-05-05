import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { Lecture } from '../../../../models/lecture.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { LessonWithLectures } from '../course-lessons-section/course-lessons-section';
import { LectureFormComponent } from './components/lecture-form/lecture-form.component';
import { LecturesListComponent } from './components/lectures-list/lectures-list.component';
import { LectureFormService } from './services/lecture-form.service';

@Component({
  selector: 'app-course-lectures-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    MessageModule,
    LectureFormComponent,
    LecturesListComponent,
  ],
  providers: [LectureFormService],
  templateUrl: './course-lectures-section.html',
})
export class CourseLecturesSectionComponent {
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly initialLessonId = input<string | null>(null);
  readonly editMode = input<boolean>(false);

  readonly lessonsChange = output<LessonWithLectures[]>();

  private readonly authState = inject(AuthStateService);
  readonly formService = inject(LectureFormService);

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });

  readonly lessonsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lesson'));
  readonly allLectures = computed(() => this.lessons().flatMap((l) => l.lectures ?? []));

  openAdd(lessonId?: string): void {
    const firstId = lessonId ?? this.lessonsOnly()[0]?.id;
    if (!firstId) {
      this.formService.error.set('Сначала добавьте урок');
      return;
    }
    this.formService.openAdd(firstId);
  }

  openEdit(lecture: Lecture): void {
    this.formService.openEdit(lecture);
  }

  async submit(): Promise<void> {
    const result = await this.formService.submit(this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }

  async deleteLecture(lecture: Lecture): Promise<void> {
    const result = await this.formService.deleteLecture(lecture, this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }
}
