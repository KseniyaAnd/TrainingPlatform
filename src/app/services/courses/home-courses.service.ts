import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Course } from '../../models/course.model';
import { CoursesService } from './courses.service';

export interface CourseSection {
  title: string;
  description: string;
  courses: Course[];
  moreLinkText: string;
  moreLinkUrl: string;
  queryParams?: Record<string, string>;
}

/**
 * Сервис для управления курсами на главной странице
 */
@Injectable()
export class HomeCoursesService {
  private readonly coursesService = inject(CoursesService);

  private readonly coursesLimit = 50;
  private readonly sectionLimit = 4;
  private readonly designTag = 'Дизайн';

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

  readonly error = computed(() => this.coursesResponse().error);

  /**
   * Получить курсы по тегу
   */
  getCoursesByTag(tag: string, limit: number = this.sectionLimit): Course[] {
    const tagLower = tag.toLowerCase();
    return this.coursesResponse()
      .items.filter((course) => course.tags?.some((t) => t.toLowerCase() === tagLower))
      .slice(0, limit);
  }

  /**
   * Получить недавние курсы (отсортированные по дате создания)
   */
  getRecentCourses(limit: number = this.sectionLimit): Course[] {
    return [...this.coursesResponse().items]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  /**
   * Получить курсы по дизайну
   */
  readonly designCourses = computed(() => this.getCoursesByTag(this.designTag));

  /**
   * Получить недавние курсы (computed)
   */
  readonly recentCourses = computed(() => this.getRecentCourses());

  /**
   * Получить секции курсов для главной страницы
   */
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
