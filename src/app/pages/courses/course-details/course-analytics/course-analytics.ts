import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
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
  imports: [CommonModule, ButtonModule, CardModule, MessageModule],
  templateUrl: './course-analytics.html',
})
export class CourseAnalyticsComponent implements OnInit {
  readonly courseId = input.required<string>();

  readonly studyPlanRequested = output<string>();

  private readonly dataService = inject(CourseDetailsDataService);

  readonly analyticsData = signal<CourseStudentAnalyticsResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly selectedStudentId = signal<string | null>(null);
  readonly studyPlanData = signal<AiStudyPlanResponse | null>(null);
  readonly loadingStudyPlan = signal(false);
  readonly studyPlanError = signal<string | null>(null);

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

    this.selectedStudentId.set(studentId);
    this.studyPlanData.set(null);
    this.studyPlanError.set(null);
    this.loadingStudyPlan.set(true);

    try {
      const plan = await firstValueFrom(
        this.dataService.getStudentAiStudyPlan(courseId, studentId),
      );
      this.studyPlanData.set(plan);
    } catch (e) {
      this.studyPlanError.set(e instanceof Error ? e.message : 'Не удалось загрузить учебный план');
    } finally {
      this.loadingStudyPlan.set(false);
    }
  }

  closeStudentPlan(): void {
    this.selectedStudentId.set(null);
    this.studyPlanData.set(null);
    this.studyPlanError.set(null);
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
}
