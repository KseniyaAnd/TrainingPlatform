import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
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
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { firstValueFrom } from 'rxjs';

import {
  AiStudyPlanResponse,
  CourseStudentAnalyticsResponse,
} from '../../../../models/analytics.model';
import { CourseDetailsDataService } from '../course-details-data.service';

@Component({
  selector: 'app-course-analytics',
  standalone: true,
  imports: [CommonModule, ButtonModule, MessageModule],
  templateUrl: './course-analytics.html',
})
export class CourseAnalyticsComponent implements OnInit {
  readonly courseId = input.required<string>();

  readonly studyPlanRequested = output<string>();

  private readonly dataService = inject(CourseDetailsDataService);

  readonly analyticsData = signal<CourseStudentAnalyticsResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly loadingStudyPlan = signal(false);

  readonly expandedStudents = signal<Set<string>>(new Set());

  ngOnInit(): void {
    void this.loadAnalytics();
  }

  async loadAnalytics(): Promise<void> {
    const courseId = this.courseId();
    if (!courseId) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const analytics = await firstValueFrom(this.dataService.getCourseStudentAnalytics(courseId));
      this.analyticsData.set(analytics);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Не удалось загрузить аналитику');
    } finally {
      this.loading.set(false);
    }
  }

  async viewStudentPlan(studentId: string): Promise<void> {
    const courseId = this.courseId();
    if (!courseId) return;

    this.loadingStudyPlan.set(true);

    try {
      const plan = await firstValueFrom(
        this.dataService.getStudentAiStudyPlan(courseId, studentId),
      );
      await this.downloadStudyPlanAsDocx(studentId, plan);
    } catch (e) {
      console.error('Не удалось загрузить учебный план:', e);
      alert(e instanceof Error ? e.message : 'Не удалось загрузить учебный план');
    } finally {
      this.loadingStudyPlan.set(false);
    }
  }

  private async downloadStudyPlanAsDocx(
    studentId: string,
    plan: AiStudyPlanResponse,
  ): Promise<void> {
    const doc = this.generateStudyPlanDocument(studentId, plan);

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Учебный_план_${studentId}_${new Date().toISOString().split('T')[0]}.docx`);
  }

  private generateStudyPlanDocument(studentId: string, plan: AiStudyPlanResponse): Document {
    const paragraphs: Paragraph[] = [];

    // Title
    paragraphs.push(
      new Paragraph({
        text: '📚 Персональный учебный план',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      }),
    );

    // Header info section
    paragraphs.push(
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
    );

    // Rationale section
    if (plan.rationale) {
      paragraphs.push(
        new Paragraph({
          text: '💡 Обоснование плана',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
        new Paragraph({
          text: plan.rationale,
          spacing: { after: 300 },
        }),
      );
    }

    // Prioritized goals
    if (plan.prioritizedGoals && plan.prioritizedGoals.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: '🎯 Приоритетные цели',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      );
      plan.prioritizedGoals.forEach((goal) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${goal}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
        );
      });
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Weekly targets
    if (plan.weeklyTargets && plan.weeklyTargets.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: '📅 Еженедельные задачи',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      );
      plan.weeklyTargets.forEach((target) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${target}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
        );
      });
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Focus areas
    if (plan.focusAreas && plan.focusAreas.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: '🔍 Области фокуса',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      );
      plan.focusAreas.forEach((area) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${area}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
        );
      });
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Recommendations
    if (plan.recommendations && plan.recommendations.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: '✅ Рекомендации',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      );
      plan.recommendations.forEach((rec) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${rec}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
        );
      });
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Recommended lessons
    if (plan.recommendedLessons && plan.recommendedLessons.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: '📖 Рекомендуемые уроки',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      );
      plan.recommendedLessons.forEach((lesson) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${lesson}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
        );
      });
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Recommended lectures
    if (plan.recommendedLectures && plan.recommendedLectures.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: '🎓 Рекомендуемые лекции',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      );
      plan.recommendedLectures.forEach((lecture) => {
        paragraphs.push(
          new Paragraph({
            text: `• ${lecture}`,
            spacing: { after: 100 },
            indent: { left: 720 },
          }),
        );
      });
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Footer
    paragraphs.push(
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
    );

    return new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });
  }

  getTrendIcon(trend: string | undefined): string {
    switch (trend) {
      case 'improving':
        return 'pi-arrow-up';
      case 'declining':
        return 'pi-arrow-down';
      default:
        return 'pi-minus';
    }
  }

  getTrendColor(trend: string | undefined): string {
    switch (trend) {
      case 'improving':
        return 'text-emerald-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getTrendLabel(trend: string | undefined): string {
    switch (trend) {
      case 'improving':
        return 'Улучшается';
      case 'declining':
        return 'Ухудшается';
      case 'stable':
        return 'Стабильно';
      default:
        return 'Неизвестно';
    }
  }

  toggleStudentExpanded(studentId: string): void {
    const expanded = this.expandedStudents();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }

    this.expandedStudents.set(newExpanded);
  }

  isStudentExpanded(studentId: string): boolean {
    return this.expandedStudents().has(studentId);
  }
}
