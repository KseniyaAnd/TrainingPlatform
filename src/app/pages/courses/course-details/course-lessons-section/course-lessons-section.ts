import { Component, computed, inject, input, output, viewChild } from '@angular/core';

import { Assessment } from '../../../../models/assessment.model';
import { CourseProgressResponse } from '../../../../models/progress.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../../models/submission.model';
import { AuthStateService } from '../../../../services/auth/auth-state.service';
import { LessonWithLectures } from '../../../../models/lesson-with-lectures.model';
import { StudentLessonsViewComponent } from './components/student-lessons-view/student-lessons-view';
import { TeacherLessonsViewComponent } from './components/teacher-lessons-view/teacher-lessons-view';

export type { LessonWithLectures };

@Component({
  selector: 'app-course-lessons-section',
  standalone: true,
  imports: [StudentLessonsViewComponent, TeacherLessonsViewComponent],
  templateUrl: './course-lessons-section.html',
})
export class CourseLessonsSectionComponent {
  readonly courseId = input.required<string>();
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly courseProgress = input<CourseProgressResponse | null>(null);
  readonly courseLevelEditMode = input<boolean>(false);

  readonly assessments = input<Assessment[]>([]);
  readonly studentAssessments = input<AssessmentStudentResponse[]>([]);
  readonly submissions = input<SubmissionResponse[]>([]);

  readonly lessonsChange = output<LessonWithLectures[]>();
  readonly assessmentsChange = output<Assessment[]>();
  readonly submissionsChange = output<SubmissionResponse[]>();
  readonly progressUpdated = output<void>();

  private readonly authState = inject(AuthStateService);

  // ViewChild references to access child component methods
  readonly teacherView = viewChild(TeacherLessonsViewComponent);

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });

  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');

  // Proxy methods for parent component (CourseDetailsPage)
  openAdd(): void {
    this.teacherView()?.openAdd();
  }

  cancelAssessmentForm(): void {
    this.teacherView()?.cancelAssessmentForm();
  }

  cancel(): void {
    this.teacherView()?.cancel();
  }

  cancelLectureForm(): void {
    this.teacherView()?.cancelLectureForm();
  }

  cancelLectureEdit(): void {
    this.teacherView()?.cancelLectureEdit();
  }

  cancelSectionEdit(): void {
    this.teacherView()?.cancelSectionEdit();
  }

  openAddLectureSection(): void {
    this.teacherView()?.openAddLectureSection();
  }
}
