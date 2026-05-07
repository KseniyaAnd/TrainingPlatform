import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AiFeaturesComponent } from '../../components/ai-features/ai-features';
import { BannerComponent } from '../../components/banner/banner';
import { CourseSectionComponent } from '../../components/course-section/course-section';
import { HomeCoursesService } from '../../services/courses/home-courses.service';
import { LoadingStateComponent } from '../../shared/components/ui/loading-state/loading-state';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [BannerComponent, AiFeaturesComponent, CourseSectionComponent, LoadingStateComponent],
  providers: [HomeCoursesService],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly homeCoursesService = inject(HomeCoursesService);

  // Expose service properties for template
  readonly loading = signal(false);
  readonly error = this.homeCoursesService.error;
  readonly courseSections = this.homeCoursesService.courseSections;
}
