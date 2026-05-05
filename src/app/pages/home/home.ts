import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AiFeaturesComponent } from '../../components/ai-features/ai-features';
import { Banner } from '../../components/banner/banner';
import { CourseSectionComponent } from '../../components/course-section/course-section';
import { LoadingStateComponent } from '../../components/loading-state/loading-state';
import { Course } from '../../models/course.model';
import { CoursesService } from '../../services/courses/courses.service';

interface CourseSection {
  title: string;
  description: string;
  courses: Course[];
  moreLinkText: string;
  moreLinkUrl: string;
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Banner, AiFeaturesComponent, CourseSectionComponent, LoadingStateComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly designTag = 'Дизайн';
  private readonly coursesLimit = 50;
  private readonly sectionLimit = 4;

  // Загрузка курсов через toSignal
  private readonly coursesResponse = toSignal(
    this.coursesService.getCourses({ limit: this.coursesLimit, cursor: null }).pipe(
      map((response) => ({
        items: response?.items ?? [],
        error: null as string | null,
      })),
    ),
    { initialValue: { items: [], error: null } },
  );

  // Состояния загрузки
  readonly loading = signal(false);
  readonly error = computed(() => this.coursesResponse().error);

  // Курсы по дизайну
  readonly designCourses = computed(() => {
    const tagLower = this.designTag.toLowerCase();
    return this.coursesResponse()
      .items.filter((course) => course.tags?.some((tag) => tag.toLowerCase() === tagLower))
      .slice(0, this.sectionLimit);
  });

  // Недавние курсы
  readonly recentCourses = computed(() =>
    [...this.coursesResponse().items]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, this.sectionLimit),
  );

  // Секции курсов
  readonly courseSections = computed<CourseSection[]>(() => [
    {
      title: 'Лучшие курсы по дизайну',
      description:
        'Освойте современные инструменты и методологии дизайна — от основ композиции и типографики до работы в Figma, Adobe XD и создания дизайн-систем. Научитесь создавать интуитивные интерфейсы, проводить UX-исследования и презентовать свои решения. Курсы подходят как начинающим дизайнерам, так и тем, кто хочет систематизировать знания и освоить новые инструменты.',
      courses: this.designCourses(),
      moreLinkText: 'Все курсы по дизайну',
      moreLinkUrl: '/courses',
      queryParams: { tag: this.designTag },
    },
    {
      title: 'Недавно вышедшие',
      description:
        'Самые свежие курсы от наших преподавателей — актуальные знания по последним трендам и технологиям. Здесь вы найдёте материалы по новым фреймворкам, обновлённым инструментам и современным подходам к разработке. Мы регулярно добавляем новые курсы, чтобы вы всегда были в курсе последних изменений в индустрии и могли применять самые эффективные практики в своей работе.',
      courses: this.recentCourses(),
      moreLinkText: 'Все курсы',
      moreLinkUrl: '/courses',
    },
  ]);
}
