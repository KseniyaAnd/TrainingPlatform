import { Component, computed, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CourseProgressResponse } from '../../../../../../models/progress.model';
import {
  AssessmentStudentResponse,
  SubmissionResponse,
} from '../../../../../../models/submission.model';
import { LessonWithLectures } from '../../../../../../models/lesson-with-lectures.model';
import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { LessonUiStateService } from '../../services/lesson-ui-state.service';
import { StudentLessonsActionsService } from '../../services/student-lessons-actions.service';
import { StudentProgressHelperService } from '../../services/student-progress-helper.service';
import { CourseProgressDisplayComponent } from '../course-progress-display/course-progress-display';
import { ErrorDisplayComponent } from '../error-display/error-display';
import { LessonContentComponent } from '../lesson-content/lesson-content';

@Component({
  selector: 'app-student-lessons-view',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CourseProgressDisplayComponent,
    ErrorDisplayComponent,
    LessonContentComponent,
  ],
  providers: [LessonUiStateService, StudentLessonsActionsService, StudentProgressHelperService],
  templateUrl: './student-lessons-view.html',
})
export class StudentLessonsViewComponent {
  readonly courseId = input.required<string>();
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly courseProgress = input<CourseProgressResponse | null>(null);
  readonly studentAssessments = input<AssessmentStudentResponse[]>([]);
  readonly submissions = input<SubmissionResponse[]>([]);

  readonly submissionsChange = output<SubmissionResponse[]>();
  readonly progressUpdated = output<void>();

  readonly uiStateService = inject(LessonUiStateService);
  readonly actionsService = inject(StudentLessonsActionsService);
  readonly progressHelper = inject(StudentProgressHelperService);

  readonly lessonsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lesson'));
  readonly lectureSectionsOnly = computed(() => this.lessons().filter((l) => l.kind === 'lecture'));

  // ── UI State ──────────────────────────────────────────────────────────────

  toggleLessonAndExpanded(lessonId: string): void {
    this.uiStateService.toggleLessonCollapsed(lessonId);
    if (!this.uiStateService.isLessonCollapsed(lessonId)) {
      this.uiStateService.setExpanded(lessonId, true);
    }
  }

  toggleSectionAndExpanded(sectionId: string): void {
    this.uiStateService.toggleLessonCollapsed(sectionId);
    if (!this.uiStateService.isLessonCollapsed(sectionId)) {
      this.uiStateService.setExpanded(sectionId, true);
    }
  }

  shouldShowLectures(lesson: LessonWithLectures): boolean {
    return (
      this.uiStateService.isExpanded(lesson.id) && lesson.lectures && lesson.lectures.length > 0
    );
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  getLessonProgress(lesson: LessonWithLectures): { completed: number; total: number } {
    return this.progressHelper.getLessonProgress(lesson, this.courseProgress());
  }

  isLectureCompleted(lectureId: string): boolean {
    return this.progressHelper.isLectureCompleted(lectureId, this.courseProgress());
  }

  getOverallProgress(): number {
    return this.progressHelper.getOverallProgress(this.courseProgress());
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async markLectureCompleted(lectureId: string): Promise<void> {
    const success = await this.actionsService.markLectureCompleted(this.courseId(), lectureId);
    if (success) {
      // Эмитим событие для перезагрузки прогресса
      this.progressUpdated.emit();
    }
  }

  getAssessmentsForLecture(lectureId: string): AssessmentStudentResponse[] {
    return this.progressHelper.getAssessmentsForLecture(lectureId, this.studentAssessments());
  }

  getSubmission(assessmentId: string): SubmissionResponse | null {
    return this.progressHelper.getSubmission(assessmentId, this.submissions());
  }

  async submitAnswer(assessment: AssessmentStudentResponse): Promise<void> {
    const result = await this.actionsService.submitAnswer(assessment, this.submissions());
    if (result) {
      this.submissionsChange.emit(result);
    }
  }
}
