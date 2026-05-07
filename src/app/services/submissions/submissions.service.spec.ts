import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import {
  AssessmentStudentResponse,
  CreateSubmissionRequest,
  SubmissionResponse,
} from '../../models/submission.model';
import { SubmissionsService } from './submissions.service';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };

  const mockAssessmentStudent: AssessmentStudentResponse = {
    id: 'assessment-123',
    courseId: 'course-123',
    title: 'Test Assessment',
    description: 'Test Description',
    questions: ['Q1', 'Q2'],
    answerKey: ['A1', 'A2'],
    rubricCriteria: ['C1', 'C2'],
    sourceType: 'LESSON',
    sourceId: 'lesson-123',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockSubmission: SubmissionResponse = {
    id: 'submission-123',
    assessmentId: 'assessment-123',
    studentId: 'student-123',
    answerText: 'My answer text',
    score: 85,
    submittedAt: '2024-01-01T00:00:00Z',
    gradedAt: '2024-01-02T00:00:00Z',
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [SubmissionsService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(SubmissionsService);
  });

  describe('getCourseAssessments', () => {
    it('should fetch assessments for a course', async () => {
      httpMock.get.mockReturnValue(of({ items: [mockAssessmentStudent] }));

      const result = await firstValueFrom(service.getCourseAssessments('course-123'));

      expect(result).toEqual([mockAssessmentStudent]);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/courses/course-123/assessments`,
      );
    });

    it('should parse JSON fields in assessments', async () => {
      const assessmentWithJsonStrings = {
        ...mockAssessmentStudent,
        questionsJson: JSON.stringify(['Q1', 'Q2']),
        answerKeyJson: JSON.stringify(['A1', 'A2']),
        rubricJson: JSON.stringify(['C1', 'C2']),
      };
      httpMock.get.mockReturnValue(of({ items: [assessmentWithJsonStrings] }));

      const result = await firstValueFrom(service.getCourseAssessments('course-123'));

      expect(result[0].questions).toEqual(['Q1', 'Q2']);
      expect(result[0].answerKey).toEqual(['A1', 'A2']);
      expect(result[0].rubricCriteria).toEqual(['C1', 'C2']);
    });

    it('should handle empty items array', async () => {
      httpMock.get.mockReturnValue(of({ items: [] }));

      const result = await firstValueFrom(service.getCourseAssessments('course-123'));

      expect(result).toEqual([]);
    });

    it('should handle missing items property', async () => {
      httpMock.get.mockReturnValue(of({}));

      const result = await firstValueFrom(service.getCourseAssessments('course-123'));

      expect(result).toEqual([]);
    });
  });

  describe('getMySubmissions', () => {
    it('should fetch submissions for current user', async () => {
      httpMock.get.mockReturnValue(of({ items: [mockSubmission] }));

      const result = await firstValueFrom(service.getMySubmissions());

      expect(result).toEqual([mockSubmission]);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/submissions/me`);
    });
  });

  describe('createSubmission', () => {
    it('should create a new submission', async () => {
      const payload: CreateSubmissionRequest = {
        assessmentId: 'assessment-123',
        answerText: 'My answer text',
      };
      httpMock.post.mockReturnValue(of(mockSubmission));

      const result = await firstValueFrom(service.createSubmission(payload));

      expect(result).toEqual(mockSubmission);
      expect(httpMock.post).toHaveBeenCalledWith(`${environment.apiUrl}/submissions`, payload);
    });
  });

  describe('getAssessmentSubmissions', () => {
    it('should fetch submissions for an assessment', async () => {
      const mockResponse = { items: [mockSubmission], nextCursor: null };
      httpMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.getAssessmentSubmissions('assessment-123'));

      expect(result).toEqual(mockResponse);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/submissions/assessment/assessment-123`,
        { params: expect.any(Object) },
      );
    });

    it('should fetch submissions with pagination params', async () => {
      const mockResponse = { items: [mockSubmission], nextCursor: 'cursor-123' };
      httpMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(
        service.getAssessmentSubmissions('assessment-123', 10, 'cursor-123'),
      );

      expect(result).toEqual(mockResponse);
      expect(httpMock.get).toHaveBeenCalled();
    });
  });

  describe('gradeSubmission', () => {
    it('should grade a submission', async () => {
      const gradedSubmission = { ...mockSubmission, score: 90 };
      httpMock.patch.mockReturnValue(of(gradedSubmission));

      const result = await firstValueFrom(service.gradeSubmission('submission-123', 90));

      expect(result.score).toBe(90);
      expect(httpMock.patch).toHaveBeenCalledWith(
        `${environment.apiUrl}/submissions/submission-123`,
        { score: 90 },
      );
    });
  });

  describe('error handling', () => {
    it('should handle getCourseAssessments error', async () => {
      const error = new Error('Not found');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getCourseAssessments('invalid-id').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Not found');
            resolve();
          },
        });
      });
    });

    it('should handle createSubmission error', async () => {
      const error = new Error('Validation failed');
      httpMock.post.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.createSubmission({ assessmentId: 'assessment-123', answerText: '' }).subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Validation failed');
            resolve();
          },
        });
      });
    });

    it('should handle gradeSubmission error', async () => {
      const error = new Error('Unauthorized');
      httpMock.patch.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.gradeSubmission('submission-123', 90).subscribe({
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
