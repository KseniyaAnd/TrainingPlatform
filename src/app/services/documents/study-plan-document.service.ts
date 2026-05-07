import { Injectable } from '@angular/core';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { saveAs } from 'file-saver';

import { AiStudyPlanResponse } from '../../models/analytics.model';

/**
 * Сервис для генерации DOCX документов учебных планов
 */
@Injectable({
  providedIn: 'root',
})
export class StudyPlanDocumentService {
  /**
   * Сгенерировать и скачать учебный план в формате DOCX
   */
  async generateAndDownload(studentId: string, plan: AiStudyPlanResponse): Promise<void> {
    const doc = this.generateDocument(studentId, plan);
    const blob = await Packer.toBlob(doc);
    const fileName = `Учебный_план_${studentId}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, fileName);
  }

  /**
   * Создать DOCX документ учебного плана
   */
  private generateDocument(studentId: string, plan: AiStudyPlanResponse): Document {
    const paragraphs: Paragraph[] = [
      ...this.createHeader(studentId, plan),
      ...this.createRationale(plan),
      ...this.createPrioritizedGoals(plan),
      ...this.createWeeklyTargets(plan),
      ...this.createFocusAreas(plan),
      ...this.createRecommendations(plan),
      ...this.createRecommendedLessons(plan),
      ...this.createRecommendedLectures(plan),
      ...this.createFooter(),
    ];

    return new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });
  }

  /**
   * Создать заголовок документа
   */
  private createHeader(studentId: string, plan: AiStudyPlanResponse): Paragraph[] {
    return [
      new Paragraph({
        text: '📚 Персональный учебный план',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Студент ID: ', bold: true }),
          new TextRun({ text: studentId }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Курс ID: ', bold: true }),
          new TextRun({ text: plan.courseId }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Текущий прогресс: ', bold: true }),
          new TextRun({ text: `${plan.currentProgress}%` }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Ожидаемое время завершения: ', bold: true }),
          new TextRun({ text: `${plan.estimatedCompletionWeeks} недель` }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Дата создания: ', bold: true }),
          new TextRun({ text: new Date().toLocaleDateString('ru-RU') }),
        ],
        spacing: { after: 400 },
      }),
    ];
  }

  /**
   * Создать секцию обоснования плана
   */
  private createRationale(plan: AiStudyPlanResponse): Paragraph[] {
    if (!plan.rationale) return [];

    return [
      new Paragraph({
        text: '💡 Обоснование плана',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        text: plan.rationale,
        spacing: { after: 300 },
      }),
    ];
  }

  /**
   * Создать секцию приоритетных целей
   */
  private createPrioritizedGoals(plan: AiStudyPlanResponse): Paragraph[] {
    if (!plan.prioritizedGoals || plan.prioritizedGoals.length === 0) return [];

    return [
      new Paragraph({
        text: '🎯 Приоритетные цели',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      ...plan.prioritizedGoals.map(
        (goal) =>
          new Paragraph({
            text: `• ${goal}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),
    ];
  }

  /**
   * Создать секцию еженедельных задач
   */
  private createWeeklyTargets(plan: AiStudyPlanResponse): Paragraph[] {
    if (!plan.weeklyTargets || plan.weeklyTargets.length === 0) return [];

    return [
      new Paragraph({
        text: '📅 Еженедельные задачи',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      ...plan.weeklyTargets.map(
        (target) =>
          new Paragraph({
            text: `• ${target}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),
    ];
  }

  /**
   * Создать секцию областей фокуса
   */
  private createFocusAreas(plan: AiStudyPlanResponse): Paragraph[] {
    if (!plan.focusAreas || plan.focusAreas.length === 0) return [];

    return [
      new Paragraph({
        text: '🔍 Области фокуса',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      ...plan.focusAreas.map(
        (area) =>
          new Paragraph({
            text: `• ${area}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),
    ];
  }

  /**
   * Создать секцию рекомендаций
   */
  private createRecommendations(plan: AiStudyPlanResponse): Paragraph[] {
    if (!plan.recommendations || plan.recommendations.length === 0) return [];

    return [
      new Paragraph({
        text: '✅ Рекомендации',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      ...plan.recommendations.map(
        (rec) =>
          new Paragraph({
            text: `• ${rec}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),
    ];
  }

  /**
   * Создать секцию рекомендуемых уроков
   */
  private createRecommendedLessons(plan: AiStudyPlanResponse): Paragraph[] {
    if (!plan.recommendedLessons || plan.recommendedLessons.length === 0) return [];

    return [
      new Paragraph({
        text: '📖 Рекомендуемые уроки',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      ...plan.recommendedLessons.map(
        (lesson) =>
          new Paragraph({
            text: `• ${lesson}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),
    ];
  }

  /**
   * Создать секцию рекомендуемых лекций
   */
  private createRecommendedLectures(plan: AiStudyPlanResponse): Paragraph[] {
    if (!plan.recommendedLectures || plan.recommendedLectures.length === 0) return [];

    return [
      new Paragraph({
        text: '🎓 Рекомендуемые лекции',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      }),
      ...plan.recommendedLectures.map(
        (lecture) =>
          new Paragraph({
            text: `• ${lecture}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),
    ];
  }

  /**
   * Создать футер документа
   */
  private createFooter(): Paragraph[] {
    return [
      new Paragraph({
        text: '',
        spacing: { before: 400 },
        border: {
          top: {
            color: 'E5E7EB',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      }),
      new Paragraph({
        text: 'Этот учебный план был автоматически сгенерирован на основе анализа вашего прогресса и результатов.',
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: 'Следуйте рекомендациям для достижения наилучших результатов в обучении.',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ];
  }
}
