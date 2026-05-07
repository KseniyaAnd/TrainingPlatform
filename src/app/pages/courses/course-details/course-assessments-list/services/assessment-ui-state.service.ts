import { Injectable, signal } from '@angular/core';

/**
 * Сервис для управления UI состоянием списка assessments
 */
@Injectable()
export class AssessmentUiStateService {
  readonly collapsedAssessments = signal<Set<string>>(new Set());
  readonly submittingAssessmentId = signal<string | null>(null);

  /**
   * Переключить свернутое состояние assessment
   */
  toggleCollapsed(assessmentId: string): void {
    const collapsed = this.collapsedAssessments();
    const newSet = new Set(collapsed);
    if (newSet.has(assessmentId)) {
      newSet.delete(assessmentId);
    } else {
      newSet.add(assessmentId);
    }
    this.collapsedAssessments.set(newSet);
  }

  /**
   * Проверить, свернут ли assessment
   */
  isCollapsed(assessmentId: string): boolean {
    return this.collapsedAssessments().has(assessmentId);
  }

  /**
   * Установить ID assessment, который отправляется
   */
  setSubmittingAssessmentId(assessmentId: string | null): void {
    this.submittingAssessmentId.set(assessmentId);
  }

  /**
   * Сбросить состояние
   */
  reset(): void {
    this.collapsedAssessments.set(new Set());
    this.submittingAssessmentId.set(null);
  }
}
