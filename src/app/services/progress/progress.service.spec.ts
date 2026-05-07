import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { AiStudyPlanResponse, CourseStudentAnalyticsResponse } from '../../models/analytics.model';
import { CourseProgressResponse } from '../../models/progress.model';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };

  const mockProgressResponse: CourseProgressResponse = {
    courseId: 'course-123',
    userId: 'user-123',
    completedLectures: 2,
    totalLectures: 10,
    progressPercent: 20,
    completedLectureIds: ['lecture-1', 'lecture-2'],
    lastCompletedAt: '2024-01-01T00:00:00Z',
  };

  const mockAnalyticsResponse: CourseStudentAnalyticsResponse = {
    courseId: 'course-123',
    courseName: 'Test Course',
    totalStudents: 1,
    averageProgress: 75,
    averageScore: 85,
    studentsAtRisk: 0,
    students: [
      {
        studentId: 'student-1',
        studentName: 'John Doe',
        progress: 75,
        averageScore: 85,
        gradedSubmissions: 5,
        totalSubmissions: 10,
      },
    ],
    topPerformers: [
      {
        studentId: 'student-1',
        studentName: 'John Doe',
        progress: 75,
        averageScore: 85,
      },
    ],
  };

  const mockStudyPlanResponse: AiStudyPlanResponse = {
    studentId: 'student-1',
    courseId: 'course-123',
    currentProgress: 75,
    recommendations: ['Focus on module 3', 'Review assessment 2'],
    focusAreas: ['Topic A', 'Topic B'],
    estimatedCompletionWeeks: 2,
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      put: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [ProgressService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(ProgressService);
  });

  describe('getCourseProgress', () => {
    it('should fetch course progress for current user', async () => {
      httpMock.get.mockReturnValue(of(mockProgressResponse));

      const result = await firstValueFrom(service.getCourseProgress('course-123'));

      expect(result).toEqual(mockProgressResponse);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/courses/course-123/progress/me`,
      );
    });

    it('should handle progress with zero completed lectures', async () => {
      const emptyProgress = {
        ...mockProgressResponse,
        completedLectures: 0,
        completedLectureIds: [],
        progressPercent: 0,
      };
      httpMock.get.mockReturnValue(of(emptyProgress));

      const result = await firstValueFrom(service.getCourseProgress('course-123'));

      expect(result.completedLectureIds).toEqual([]);
      expect(result.progressPercent).toBe(0);
    });
  });

  describe('markLectureCompleted', () => {
    it('should mark a lecture as completed', async () => {
      const updatedProgress = {
        ...mockProgressResponse,
        completedLectures: 3,
        completedLectureIds: [...mockProgressResponse.completedLectureIds, 'lecture-3'],
        progressPercent: 30,
      };
      httpMock.put.mockReturnValue(of(updatedProgress));

      const result = await firstValueFrom(
        service.markLectureCompleted('course-123', 'user-123', 'lecture-3'),
      );

      expect(result.completedLectureIds).toContain('lecture-3');
      expect(result.progressPercent).toBe(30);
      expect(httpMock.put).toHaveBeenCalledWith(
        `${environment.apiUrl}/courses/course-123/users/user-123/progress/lectures/lecture-3`,
        { completed: true },
      );
    });
  });

  describe('getCourseStudentAnalytics', () => {
    it('should fetch student analytics for a course', async () => {
      httpMock.get.mockReturnValue(of(mockAnalyticsResponse));

      const result = await firstValueFrom(service.getCourseStudentAnalytics('course-123'));

      expect(result).toEqual(mockAnalyticsResponse);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/courses/course-123/ai/student-analytics`,
      );
    });
  });

  describe('getStudentAiStudyPlan', () => {
    it('should fetch AI study plan for a student', async () => {
      httpMock.get.mockReturnValue(of(mockStudyPlanResponse));

      const result = await firstValueFrom(service.getStudentAiStudyPlan('course-123', 'student-1'));

      expect(result).toEqual(mockStudyPlanResponse);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/courses/course-123/students/student-1/ai-study-plan`,
      );
    });
  });

  describe('error handling', () => {
    it('should handle getCourseProgress error', async () => {
      const error = new Error('Not found');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getCourseProgress('invalid-id').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Not found');
            resolve();
          },
        });
      });
    });

    it('should handle markLectureCompleted error', async () => {
      const error = new Error('Unauthorized');
      httpMock.put.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.markLectureCompleted('course-123', 'user-123', 'lecture-1').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Unauthorized');
            resolve();
          },
        });
      });
    });
  });
});
