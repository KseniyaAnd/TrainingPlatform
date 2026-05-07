import { inject, Injectable } from '@angular/core';

import { LessonWithLectures } from '../../../../../models/lesson-with-lectures.model';
import { EditModeManagerService } from './edit-mode-manager.service';
import { LectureFormService } from './lecture-form.service';
import { LectureSectionFormService } from './lecture-section-form.service';
import { LessonFormService } from './lesson-form.service';

/**
 * Вспомогательный сервис для управления режимами редактирования
 * Содержит сложную логику открытия/закрытия форм редактирования
 */
@Injectable()
export class LessonEditModeHelperService {
  private readonly lessonFormService = inject(LessonFormService);
  private readonly lectureFormService = inject(LectureFormService);
  private readonly lectureSectionFormService = inject(LectureSectionFormService);
  private readonly editModeService = inject(EditModeManagerService);

  /**
   * Переключить режим редактирования урока
   */
  toggleLessonEditMode(lessonId: string, lessons: LessonWithLectures[]): void {
    const opened = this.editModeService.toggleLessonEditMode(lessonId);
    if (opened) {
      const lesson = lessons.find((l) => l.id === lessonId);
      if (lesson) {
        this.lessonFormService.openEditLesson(lesson);
      }
    } else {
      this.lessonFormService.cancel();
    }
  }

  /**
   * Отменить редактирование урока
   */
  cancelLessonEdit(): void {
    this.lessonFormService.cancel();
    this.editModeService.closeLessonEditMode();
  }

  /**
   * Переключить режим редактирования лекции
   */
  toggleLectureEditMode(lectureId: string, lessons: LessonWithLectures[]): void {
    const opened = this.editModeService.toggleLectureEditMode(lectureId);

    if (opened) {
      // Закрываем форму добавления если открыта
      if (this.lectureFormService.showForm() && !this.lectureFormService.editingId()) {
        this.lectureFormService.cancel();
      }

      // Находим и открываем лекцию для редактирования
      for (const lesson of lessons) {
        const lecture = lesson.lectures?.find((l) => l.id === lectureId);
        if (lecture) {
          this.lectureFormService.openEditLecture(lecture, lesson.id);
          break;
        }
      }
    } else {
      this.lectureFormService.cancel();
    }
  }

  /**
   * Отменить редактирование лекции
   */
  cancelLectureEdit(): void {
    this.lectureFormService.cancel();
    this.editModeService.closeLectureEditMode();
  }

  /**
   * Переключить режим редактирования секции
   */
  toggleSectionEditMode(sectionId: string, lessons: LessonWithLectures[]): void {
    const opened = this.editModeService.toggleSectionEditMode(sectionId);
    if (opened) {
      const section = lessons.find((l) => l.id === sectionId);
      if (section) {
        this.lectureSectionFormService.openEditSection(section);
      }
    } else {
      this.lectureSectionFormService.cancel();
    }
  }

  /**
   * Отменить редактирование секции
   */
  cancelSectionEdit(): void {
    this.lectureSectionFormService.cancel();
    this.editModeService.closeSectionEditMode();
  }
}
