import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { Course } from '../../models/course.model';
import { CoursesService, EnrollmentResponse } from './courses.service';

describe('CoursesService', () => {
  let service: CoursesService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockCourse: Course = {
    id: 'course-123',
    title: 'Test Course',
    description: 'Test Description',
    tags: ['test', 'angular'],
    createdAt: '2024-01-01T00:00:00Z',
    teacherId: 'teacher-123',
  };

  const mockEnrollmentResponse: EnrollmentResponse = {
    enrollmentId: 'enrollment-123',
    courseId: 'course-123',
    enrolledAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [CoursesService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(CoursesService);
  });

  describe('getCourseById', () => {
    it('should fetch course by id', async () => {
      httpMock.get.mockReturnValue(of({ course: mockCourse }));

      const result = await firstValueFrom(service.getCourseById('course-123'));

      expect(result).toEqual(mockCourse);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/courses/course-123`);
    });

    it('should handle direct course response', async () => {
      httpMock.get.mockReturnValue(of(mockCourse));

      const result = await firstValueFrom(service.getCourseById('course-123'));

      expect(result).toEqual(mockCourse);
    });
  });

  describe('getCourses', () => {
    it('should fetch courses with default params', async () => {
      const mockResponse = { items: [mockCourse], nextCursor: null };
      httpMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.getCourses());

      expect(result).toEqual(mockResponse);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/courses`, {
        params: expect.any(Object),
      });
    });

    it('should fetch courses with query params', async () => {
      const mockResponse = { items: [mockCourse], nextCursor: 'cursor-123' };
      httpMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(
        service.getCourses({ limit: 10, cursor: 'cursor-123', q: 'test' }),
      );

      expect(result).toEqual(mockResponse);
      expect(httpMock.get).toHaveBeenCalled();
    });
  });

  describe('getMyCourses', () => {
    it('should fetch my courses', async () => {
      const mockResponse = { items: [mockCourse], nextCursor: null };
      httpMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.getMyCourses());

      expect(result).toEqual(mockResponse);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/courses/me`, {
        params: expect.any(Object),
      });
    });
  });

  describe('getEnrolledCourses', () => {
    it('should fetch enrolled courses', async () => {
      const mockResponse = {
        items: [{ enrollmentId: 'enr-1', course: mockCourse, enrolledAt: '2024-01-01' }],
        nextCursor: null,
      };
      httpMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.getEnrolledCourses());

      expect(result).toEqual(mockResponse);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/courses/enrolled/me`, {
        params: expect.any(Object),
      });
    });
  });

  describe('loadCoursesWithEnrollmentStatus', () => {
    it('should combine courses with enrollment status', async () => {
      const allCoursesResponse = { items: [mockCourse], nextCursor: null };
      const enrolledResponse = {
        items: [{ enrollmentId: 'enr-1', course: mockCourse, enrolledAt: '2024-01-01' }],
        nextCursor: null,
      };

      httpMock.get.mockImplementation((url: string) => {
        if (url.includes('/enrolled/me')) {
          return of(enrolledResponse);
        }
        return of(allCoursesResponse);
      });

      const result = await firstValueFrom(service.loadCoursesWithEnrollmentStatus());

      expect(result).toHaveLength(1);
      expect(result[0].isEnrolled).toBe(true);
      expect(result[0].enrollmentId).toBe('enr-1');
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const payload = {
        title: 'New Course',
        description: 'New Description',
        tags: ['new'],
      };
      httpMock.post.mockReturnValue(of(mockCourse));

      const result = await firstValueFrom(service.createCourse(payload));

      expect(result).toEqual(mockCourse);
      expect(httpMock.post).toHaveBeenCalledWith(`${environment.apiUrl}/courses`, payload);
    });
  });

  describe('updateCourse', () => {
    it('should update a course', async () => {
      const payload = { title: 'Updated Title' };
      httpMock.patch.mockReturnValue(of({ ...mockCourse, ...payload }));

      const result = await firstValueFrom(service.updateCourse('course-123', payload));

      expect(result.title).toBe('Updated Title');
      expect(httpMock.patch).toHaveBeenCalledWith(
        `${environment.apiUrl}/courses/course-123`,
        payload,
      );
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      httpMock.delete.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.deleteCourse('course-123'));

      expect(result).toBeUndefined();
      expect(httpMock.delete).toHaveBeenCalledWith(`${environment.apiUrl}/courses/course-123`);
    });
  });

  describe('enroll', () => {
    it('should enroll in a course', async () => {
      httpMock.post.mockReturnValue(of(mockEnrollmentResponse));

      const result = await firstValueFrom(service.enroll('course-123'));

      expect(result).toEqual(mockEnrollmentResponse);
      expect(httpMock.post).toHaveBeenCalledWith(`${environment.apiUrl}/enrollments`, {
        courseId: 'course-123',
      });
    });
  });

  describe('unenroll', () => {
    it('should unenroll from a course', async () => {
      httpMock.delete.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.unenroll('enrollment-123'));

      expect(result).toBeUndefined();
      expect(httpMock.delete).toHaveBeenCalledWith(
        `${environment.apiUrl}/enrollments/enrollment-123`,
      );
    });
  });

  describe('error handling', () => {
    it('should handle getCourseById error', async () => {
      const error = new Error('Not found');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getCourseById('invalid-id').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Not found');
            resolve();
          },
        });
      });
    });

    it('should handle createCourse error', async () => {
      const error = new Error('Validation failed');
      httpMock.post.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.createCourse({ title: '', description: '', tags: [] }).subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Validation failed');
            resolve();
          },
        });
      });
    });
  });
});
