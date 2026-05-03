import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Course } from '../../models/course.model';
import { CourseSliderComponent } from '../course-slider/course-slider';

@Component({
  selector: 'app-course-section',
  standalone: true,
  imports: [CourseSliderComponent],
  templateUrl: './course-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseSectionComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly courses = input.required<Course[]>();
  readonly showMoreLink = input(false);
  readonly moreLinkText = input('Смотреть все');
  readonly moreLinkUrl = input('/courses');
  readonly moreLinkQueryParams = input<Record<string, string>>({});
  readonly showEmptyState = input(false);
  readonly emptyStateText = input('Курсы не найдены');
}
