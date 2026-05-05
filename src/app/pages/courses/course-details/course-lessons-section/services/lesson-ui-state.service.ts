import { Injectable, signal } from '@angular/core';

/**
 * Сервис для управления состоянием UI секции уроков
 * (развернутые/свернутые элементы)
 */
@Injectable()
export class LessonUiStateService {
  readonly expandedLessons = signal<Set<string>>(new Set());
  readonly collapsedLessons = signal<Set<string>>(new Set());
  readonly collapsedLectures = signal<Set<string>>(new Set());
  readonly collapsedAssessments = signal<Set<string>>(new Set());

  toggleExpanded(lessonId: string): void {
    const s = new Set(this.expandedLessons());
    s.has(lessonId) ? s.delete(lessonId) : s.add(lessonId);
    this.expandedLessons.set(s);
  }

  setExpanded(lessonId: string, expanded: boolean): void {
    const s = new Set(this.expandedLessons());
    if (expanded) {
      s.add(lessonId);
    } else {
      s.delete(lessonId);
    }
    this.expandedLessons.set(s);
  }

  isExpanded(lessonId: string): boolean {
    return this.expandedLessons().has(lessonId);
  }

  toggleLessonCollapsed(lessonId: string): void {
    const s = new Set(this.collapsedLessons());
    s.has(lessonId) ? s.delete(lessonId) : s.add(lessonId);
    this.collapsedLessons.set(s);
  }

  isLessonCollapsed(lessonId: string): boolean {
    return this.collapsedLessons().has(lessonId);
  }

  toggleLectureCollapsed(lectureId: string): void {
    const s = new Set(this.collapsedLectures());
    s.has(lectureId) ? s.delete(lectureId) : s.add(lectureId);
    this.collapsedLectures.set(s);
  }

  isLectureCollapsed(lectureId: string): boolean {
    return this.collapsedLectures().has(lectureId);
  }

  toggleAssessmentCollapsed(assessmentId: string): void {
    const s = new Set(this.collapsedAssessments());
    s.has(assessmentId) ? s.delete(assessmentId) : s.add(assessmentId);
    this.collapsedAssessments.set(s);
  }

  isAssessmentCollapsed(assessmentId: string): boolean {
    return this.collapsedAssessments().has(assessmentId);
  }

  reset(): void {
    this.expandedLessons.set(new Set());
    this.collapsedLessons.set(new Set());
    this.collapsedLectures.set(new Set());
    this.collapsedAssessments.set(new Set());
  }
}
