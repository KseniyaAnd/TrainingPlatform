import { Injectable, signal } from '@angular/core';

/**
 * Сервис для управления режимами редактирования
 * Отвечает за: lesson edit mode, section edit mode, lecture edit mode
 */
@Injectable()
export class EditModeManagerService {
  // Edit mode signals
  readonly lessonEditMode = signal<string | null>(null);
  readonly sectionEditMode = signal<string | null>(null);
  readonly lectureEditMode = signal<string | null>(null);

  /**
   * Переключить режим редактирования урока
   * @returns true если открыли, false если закрыли
   */
  toggleLessonEditMode(lessonId: string): boolean {
    if (this.lessonEditMode() === lessonId) {
      this.lessonEditMode.set(null);
      return false; // Закрыли
    } else {
      this.lessonEditMode.set(lessonId);
      return true; // Открыли
    }
  }

  /**
   * Проверить, редактируется ли урок
   */
  isLessonInEditMode(lessonId: string): boolean {
    return this.lessonEditMode() === lessonId;
  }

  /**
   * Закрыть режим редактирования урока
   */
  closeLessonEditMode(): void {
    this.lessonEditMode.set(null);
  }

  /**
   * Переключить режим редактирования секции
   * @returns true если открыли, false если закрыли
   */
  toggleSectionEditMode(sectionId: string): boolean {
    if (this.sectionEditMode() === sectionId) {
      this.sectionEditMode.set(null);
      return false;
    } else {
      this.sectionEditMode.set(sectionId);
      return true;
    }
  }

  /**
   * Проверить, редактируется ли секция
   */
  isSectionInEditMode(sectionId: string): boolean {
    return this.sectionEditMode() === sectionId;
  }

  /**
   * Закрыть режим редактирования секции
   */
  closeSectionEditMode(): void {
    this.sectionEditMode.set(null);
  }

  /**
   * Переключить режим редактирования лекции
   * @returns true если открыли, false если закрыли
   */
  toggleLectureEditMode(lectureId: string): boolean {
    if (this.lectureEditMode() === lectureId) {
      this.lectureEditMode.set(null);
      return false;
    } else {
      this.lectureEditMode.set(lectureId);
      return true;
    }
  }

  /**
   * Проверить, редактируется ли лекция
   */
  isLectureInEditMode(lectureId: string): boolean {
    return this.lectureEditMode() === lectureId;
  }

  /**
   * Закрыть режим редактирования лекции
   */
  closeLectureEditMode(): void {
    this.lectureEditMode.set(null);
  }

  /**
   * Закрыть все режимы редактирования
   */
  closeAllEditModes(): void {
    this.lessonEditMode.set(null);
    this.sectionEditMode.set(null);
    this.lectureEditMode.set(null);
  }

  /**
   * Сбросить состояние
   */
  reset(): void {
    this.closeAllEditModes();
  }
}
