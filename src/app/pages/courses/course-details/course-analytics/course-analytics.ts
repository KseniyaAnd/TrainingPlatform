import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { firstValueFrom } from 'rxjs';

import { CourseStudentAnalyticsResponse } from '../../../../models/analytics.model';
import { AnalyticsFormatterService } from '../../../../services/analytics/analytics-formatter.service';
import { CourseDataService } from '../../../../services/courses/course-data.service';
import { StudyPlanDocumentService } from '../../../../services/documents/study-plan-document.service';
import { ButtonComponent } from '../../../../shared/components/ui/button/button';
import { StudentAnalyticsCardComponent } from './components/student-analytics-card/student-analytics-card';

@Component({
  selector: 'app-course-analytics',
  standalone: true,
  imports: [ButtonComponent, MessageModule, StudentAnalyticsCardComponent],
  templateUrl: './course-analytics.html',
})
export class CourseAnalyticsComponent implements OnInit {
  readonly courseId = input.required<string>();

  readonly studyPlanRequested = output<string>();

  private readonly dataService = inject(CourseDataService);
  private readonly documentService = inject(StudyPlanDocumentService);
  readonly formatter = inject(AnalyticsFormatterService);

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
      await this.documentService.generateAndDownload(studentId, plan);
    } catch (e) {
      console.error('Не удалось загрузить учебный план:', e);
      alert(e instanceof Error ? e.message : 'Не удалось загрузить учебный план');
    } finally {
      this.loadingStudyPlan.set(false);
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
