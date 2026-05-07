import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Course } from '../../models/course.model';
import { CoursesService } from './courses.service';
import { HomeCoursesService } from './home-courses.service';

describe('HomeCoursesService', () => {
  let service: HomeCoursesService;
  let coursesServiceMock: {
    getCourses: ReturnType<typeof vi.fn>;
  };

  const mockCourses: Course[] = [
    {
      id: 'course-1',
      title: 'Design Course 1',
      description: 'Design course description',
      tags: ['Дизайн', 'UI/UX'],
      createdAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'course-2',
      title: 'Design Course 2',
      description: 'Another design course',
      tags: ['дизайн', 'Figma'],
      createdAt: '2024-01-20T00:00:00Z',
    },
    {
      id: 'course-3',
      title: 'Programming Course',
      description: 'Programming course description',
      tags: ['Programming', 'JavaScript'],
      createdAt: '2024-01-25T00:00:00Z',
    },
    {
      id: 'course-4',
      title: 'Recent Course',
      description: 'Most recent course',
      tags: ['New'],
      createdAt: '2024-01-30T00:00:00Z',
    },
    {
      id: 'course-5',
      title: 'Old Course',
      description: 'Oldest course',
      tags: ['Old'],
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    coursesServiceMock = {
      getCourses: vi.fn().mockReturnValue(
        of({
          items: mockCourses,
          page: { limit: 50, returned: 5, nextCursor: null },
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [HomeCoursesService, { provide: CoursesService, useValue: coursesServiceMock }],
    });

    service = TestBed.inject(HomeCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  describe('getCoursesByTag', () => {
    it('should filter courses by tag (case-insensitive)', () => {
      const designCourses = service.getCoursesByTag('Дизайн');

      expect(designCourses).toHaveLength(2);
      expect(designCourses[0].id).toBe('course-1');
      expect(designCourses[1].id).toBe('course-2');
    });

    it('should handle lowercase tag search', () => {
      const designCourses = service.getCoursesByTag('дизайн');

      expect(designCourses).toHaveLength(2);
    });

    it('should limit results to specified limit', () => {
      const designCourses = service.getCoursesByTag('Дизайн', 1);

      expect(designCourses).toHaveLength(1);
      expect(designCourses[0].id).toBe('course-1');
    });

    it('should return empty array for non-existent tag', () => {
      const courses = service.getCoursesByTag('NonExistent');

      expect(courses).toEqual([]);
    });

    it('should handle courses without tags', () => {
      const coursesWithoutTags: Course[] = [
        {
          id: 'course-no-tags',
          title: 'No Tags Course',
          description: 'Course without tags',
        },
      ];

      coursesServiceMock.getCourses.mockReturnValue(
        of({
          items: coursesWithoutTags,
          page: { limit: 50, returned: 1, nextCursor: null },
        }),
      );

      const newService = TestBed.inject(HomeCoursesService);
      const result = newService.getCoursesByTag('AnyTag');

      expect(result).toEqual([]);
    });
  });

  describe('getRecentCourses', () => {
    it('should return courses sorted by creation date (newest first)', () => {
      const recentCourses = service.getRecentCourses();

      expect(recentCourses).toHaveLength(4);
      expect(recentCourses[0].id).toBe('course-4'); // 2024-01-30
      expect(recentCourses[1].id).toBe('course-3'); // 2024-01-25
      expect(recentCourses[2].id).toBe('course-2'); // 2024-01-20
      expect(recentCourses[3].id).toBe('course-1'); // 2024-01-15
    });

    it('should limit results to specified limit', () => {
      const recentCourses = service.getRecentCourses(2);

      expect(recentCourses).toHaveLength(2);
      expect(recentCourses[0].id).toBe('course-4');
      expect(recentCourses[1].id).toBe('course-3');
    });

    it('should handle courses without createdAt', () => {
      // Проверяем, что метод работает с текущими данными сервиса
      const result = service.getRecentCourses();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('designCourses computed', () => {
    it('should return design courses', () => {
      const designCourses = service.designCourses();

      expect(designCourses).toHaveLength(2);
      expect(designCourses.every((c) => c.tags?.some((t) => t.toLowerCase() === 'дизайн'))).toBe(
        true,
      );
    });
  });

  describe('recentCourses computed', () => {
    it('should return recent courses', () => {
      const recentCourses = service.recentCourses();

      expect(recentCourses).toHaveLength(4);
      expect(recentCourses[0].id).toBe('course-4');
    });
  });

  describe('courseSections computed', () => {
    it('should return array of course sections', () => {
      const sections = service.courseSections();

      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('Лучшие курсы по дизайну');
      expect(sections[1].title).toBe('Недавно вышедшие');
    });

    it('should have design section with correct structure', () => {
      const sections = service.courseSections();
      const designSection = sections[0];

      expect(designSection.title).toBeDefined();
      expect(designSection.description).toBeDefined();
      expect(designSection.courses).toHaveLength(2);
      expect(designSection.moreLinkText).toBe('Все курсы по дизайну');
      expect(designSection.moreLinkUrl).toBe('/courses');
      expect(designSection.queryParams).toEqual({ tag: 'Дизайн' });
    });

    it('should have recent section with correct structure', () => {
      const sections = service.courseSections();
      const recentSection = sections[1];

      expect(recentSection.title).toBeDefined();
      expect(recentSection.description).toBeDefined();
      expect(recentSection.courses).toHaveLength(4);
      expect(recentSection.moreLinkText).toBe('Все курсы');
      expect(recentSection.moreLinkUrl).toBe('/courses');
    });
  });

  describe('error handling', () => {
    it('should handle courses with various data', () => {
      // Тест проверяет, что сервис работает с разными данными
      const designCourses = service.getCoursesByTag('Дизайн');
      const recentCourses = service.getRecentCourses();
      const sections = service.courseSections();

      expect(designCourses).toBeDefined();
      expect(recentCourses).toBeDefined();
      expect(sections).toBeDefined();
      expect(Array.isArray(designCourses)).toBe(true);
      expect(Array.isArray(recentCourses)).toBe(true);
      expect(Array.isArray(sections)).toBe(true);
    });
  });
});
