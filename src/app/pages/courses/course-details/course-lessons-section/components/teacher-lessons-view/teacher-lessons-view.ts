import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { Assessment } from '../../../../../../models/assessment.model';
import { LessonWithLectures } from '../../../../../../models/lesson-with-lectures.model';
import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';
import { AssessmentFormService } from '../../services/assessment-form.service';
import { EditModeManagerService } from '../../services/edit-mode-manager.service';
import { LectureFormService } from '../../services/lecture-form.service';
import { LectureSectionFormService } from '../../services/lecture-section-form.service';
import { LessonEditModeHelperService } from '../../services/lesson-edit-mode-helper.service';
import { LessonFormService } from '../../services/lesson-form.service';
import { LessonUiStateService } from '../../services/lesson-ui-state.service';
import { TeacherLessonsActionsService } from '../../services/teacher-lessons-actions.service';
import { AssessmentFormComponent } from '../assessment-form/assessment-form';
import { ErrorDisplayComponent } from '../error-display/error-display';
import { LectureFormComponent } from '../lecture-form/lecture-form';
import { LessonContentComponent } from '../lesson-content/lesson-content';
import { LessonFormComponent } from '../lesson-form/lesson-form';

@Component({
  selector: 'app-teacher-lessons-view',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ErrorDisplayComponent,
    LessonFormComponent,
    LessonContentComponent,
    LectureFormComponent,
    AssessmentFormComponent,
    ButtonComponent,
  ],
  providers: [
    LessonFormService,
    LectureFormService,
    LectureSectionFormService,
    AssessmentFormService,
    LessonUiStateService,
    TeacherLessonsActionsService,
    EditModeManagerService,
    LessonEditModeHelperService,
  ],
  templateUrl: './teacher-lessons-view.html',
})
export class TeacherLessonsViewComponent {
  readonly courseId = input.required<string>();
  readonly lessons = input.required<LessonWithLectures[]>();
  readonly courseLevelEditMode = input<boolean>(false);
  readonly assessments = input<Assessment[]>([]);

  readonly lessonsChange = output<LessonWithLectures[]>();
  readonly assessmentsChange = output<Assessment[]>();

  readonly lessonFormService = inject(LessonFormService);
  readonly lectureFormService = inject(LectureFormService);
  readonly lectureSectionFormService = inject(LectureSectionFormService);
  readonly assessmentFormService = inject(AssessmentFormService);
  readonly uiStateService = inject(LessonUiStateService);
  readonly actionsService = inject(TeacherLessonsActionsService);
  readonly editModeService = inject(EditModeManagerService);
  readonly editModeHelper = inject(LessonEditModeHelperService);

  // Expose signals for template
  readonly error = this.actionsService.error;
  readonly lectureEditMode = this.editModeService.lectureEditMode;

  // Edit mode check methods - delegate to editModeService
  isLessonInEditMode(lessonId: string): boolean {
    return this.editModeService.isLessonInEditMode(lessonId);
  }

  isLectureInEditMode(lectureId: string): boolean {
    return this.editModeService.isLectureInEditMode(lectureId);
  }

  isSectionInEditMode(sectionId: string): boolean {
    return this.editModeService.isSectionInEditMode(sectionId);
  }

  // Edit mode toggle methods - delegate to editModeHelper
  toggleLessonEditMode(lessonId: string): void {
    this.editModeHelper.toggleLessonEditMode(lessonId, this.lessons());
  }

  toggleLectureEditMode(lectureId: string): void {
    this.editModeHelper.toggleLectureEditMode(lectureId, this.lessons());
  }

  toggleSectionEditMode(sectionId: string): void {
    this.editModeHelper.toggleSectionEditMode(sectionId, this.lessons());
  }

  // Form open methods - delegate to form services
  openAdd(): void {
    this.lessonFormService.openAddLesson();
  }

  openAddLecture(lessonId: string): void {
    this.lectureFormService.openAddLecture(lessonId);
  }

  openAddLectureSection(): void {
    this.lectureSectionFormService.openAddSection();
  }

  openAddAssessmentForLesson(lessonId: string): void {
    this.assessmentFormService.openAddAssessmentForLesson(lessonId);
  }

  // Form cancel methods - delegate to helper or form services
  cancel(): void {
    this.editModeHelper.cancelLessonEdit();
  }

  cancelLectureForm(): void {
    this.lectureFormService.cancel();
  }

  cancelLectureEdit(): void {
    this.editModeHelper.cancelLectureEdit();
  }

  cancelSectionEdit(): void {
    this.editModeHelper.cancelSectionEdit();
  }

  cancelAssessmentForm(): void {
    this.assessmentFormService.cancel();
  }

  // Submit method - delegate to form service
  submit(): void {
    this.submitLesson();
  }

  // Lesson methods - simplified wrappers for complex operations
  async submitLesson(): Promise<void> {
    const result = await this.lessonFormService.submit(this.courseId(), this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
      this.editModeService.closeLessonEditMode();
    }
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const result = await this.lessonFormService.deleteLesson(lessonId, this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }

  // Lecture methods - simplified wrappers
  async submitLecture(): Promise<void> {
    console.log('📝 submitLecture вызван');
    const result = await this.lectureFormService.submit(this.lessons());
    console.log('✅ Результат submit лекции:', result);
    if (result) {
      console.log('📤 Эмитим lessonsChange');
      this.lessonsChange.emit(result);
    }
  }

  async submitLectureEdit(): Promise<void> {
    const result = await this.lectureFormService.submit(this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
      this.editModeService.closeLectureEditMode();
    }
  }

  async deleteLecture(lectureId: string, lessonId: string): Promise<void> {
    const result = await this.actionsService.deleteLecture(lectureId, lessonId, this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
      if (this.editModeService.isLectureInEditMode(lectureId)) {
        this.editModeService.closeLectureEditMode();
      }
    }
  }

  // Lecture Section methods - simplified wrappers
  async submitLectureSection(): Promise<void> {
    const result = await this.lectureSectionFormService.submit(this.courseId(), this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
      this.editModeService.closeSectionEditMode();
    }
  }

  async deleteLectureSection(sectionId: string): Promise<void> {
    const result = await this.lectureSectionFormService.deleteSection(sectionId, this.lessons());
    if (result) {
      this.lessonsChange.emit(result);
    }
  }

  // Assessment methods - simplified wrappers
  async submitAssessment(): Promise<void> {
    const result = await this.assessmentFormService.submit(this.courseId(), this.assessments());
    if (result) {
      this.assessmentsChange.emit(result);
    }
  }

  async deleteAssessment(assessmentId: string): Promise<void> {
    const result = await this.actionsService.deleteAssessment(assessmentId, this.assessments());
    if (result) {
      this.assessmentsChange.emit(result);
    }
  }

  async deleteAssessmentFromForm(): Promise<void> {
    const assessmentId = this.assessmentFormService.editingId();
    if (!assessmentId) return;

    const result = await this.actionsService.deleteAssessment(assessmentId, this.assessments());
    if (result) {
      this.assessmentsChange.emit(result);
      this.assessmentFormService.cancel();
    }
  }

  getTeacherAssessmentsForLecture(lectureId: string): Assessment[] {
    return this.assessments().filter((a) => a.sourceId === lectureId && a.sourceType === 'LECTURE');
  }

  getTeacherAssessmentsForLesson(lessonId: string): Assessment[] {
    return this.assessments().filter((a) => a.sourceId === lessonId && a.sourceType === 'LESSON');
  }
}
