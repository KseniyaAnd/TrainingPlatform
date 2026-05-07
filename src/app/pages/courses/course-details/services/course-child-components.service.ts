import { Injectable, signal } from '@angular/core';

import { CourseAssessmentsListComponent } from '../course-assessments-list/course-assessments-list';
import { CourseLessonsSectionComponent } from '../course-lessons-section/course-lessons-section';

/**
 * Сервис для управления дочерними компонентами страницы деталей курса
 * Предоставляет методы для взаимодействия с дочерними компонентами
 */
@Injectable()
export class CourseChildComponentsService {
  readonly lessonsSection = signal<CourseLessonsSectionComponent | undefined>(undefined);
  readonly assessmentsList = signal<CourseAssessmentsListComponent | undefined>(undefined);

  /**
   * Зарегистрировать компонент уроков
   */
  registerLessonsSection(component: CourseLessonsSectionComponent | undefined): void {
    this.lessonsSection.set(component);
  }

  /**
   * Зарегистрировать компонент assessments
   */
  registerAssessmentsList(component: CourseAssessmentsListComponent | undefined): void {
    this.assessmentsList.set(component);
  }

  /**
   * Отменить все формы редактирования
   */
  cancelAllForms(): void {
    this.assessmentsList()?.cancelAssessmentForm();
    const lessons = this.lessonsSection();
    if (lessons) {
      lessons.cancelAssessmentForm();
      lessons.cancel();
      lessons.cancelLectureForm();
      lessons.cancelLectureEdit();
      lessons.cancelSectionEdit();
    }
  }

  /**
   * Открыть форму добавления урока
   */
  openAddLesson(): void {
    this.lessonsSection()?.openAdd();
  }

  /**
   * Открыть форму добавления секции лекций
   */
  openAddLectureSection(): void {
    this.lessonsSection()?.openAddLectureSection();
  }
}
