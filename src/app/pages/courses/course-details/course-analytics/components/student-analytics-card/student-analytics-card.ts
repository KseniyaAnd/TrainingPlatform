import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { CourseStudentAnalyticsResponse } from '../../../../../../models/analytics.model';
import { AnalyticsFormatterService } from '../../../../../../services/analytics/analytics-formatter.service';
import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';

type StudentAnalytics = NonNullable<CourseStudentAnalyticsResponse['students']>[number];

@Component({
  selector: 'app-student-analytics-card',
  standalone: true,
  imports: [NgClass, ButtonComponent],
  templateUrl: './student-analytics-card.html',
})
export class StudentAnalyticsCardComponent {
  readonly student = input.required<StudentAnalytics>();
  readonly expanded = input(false);
  readonly loading = input(false);

  readonly toggleExpanded = output<void>();
  readonly downloadPlan = output<void>();

  constructor(readonly formatter: AnalyticsFormatterService) {}
}
