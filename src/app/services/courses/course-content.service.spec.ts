import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { Assessment } from '../../models/assessment.model';
import { Lecture } from '../../models/lecture.model';
import { Lesson } from '../../models/lesson.model';
import {
  AssessmentDraftResponse,
  CourseContentService,
  CreateAssessmentRequest,
  CreateLectureRequest,
  CreateLessonRequest,
} from './course-content.service';

describe('CourseContentService', () => {
  let service: CourseContentService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockLesson: Lesson = {
    id: 'lesson-123',
    courseId: 'course-123',
    title: 'Test Lesson',
    kind: 'lesson',
    content: 'Test Content',
  };

  const mockLecture: Lecture = {
    id: 'lecture-123',
    lessonId: 'lesson-123',
    title: 'Test Lecture',
    videoUrl: 'https://example.com/video.mp4',
    content: 'Lecture content',
  };

  const mockAssessment: Assessment = {
    id: 'assessment-123',
    courseId: 'course-123',
    lessonId: 'lesson-123',
    title: 'Test Assessment',
    description: 'Test Description',
    questions: ['Question 1', 'Question 2'],
    answerKey: ['Answer 1', 'Answer 2'],
    rubricCriteria: ['Criteria 1', 'Criteria 2'],
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [CourseContentService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(CourseContentService);
  });

  describe('getLessonsByCourseId', () => {
    it('should fetch lessons for a course', async () => {
      httpMock.get.mockReturnValue(of({ lessons: [mockLesson] }));

      const result = await firstValueFrom(service.getLessonsByCourseId('course-123'));

      expect(result).toEqual([mockLesson]);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/courses/course-123/lessons`);
    });

    it('should handle array response', async () => {
      httpMock.get.mockReturnValue(of([mockLesson]));

      const result = await firstValueFrom(service.getLessonsByCourseId('course-123'));

      expect(result).toEqual([mockLesson]);
    });
  });

  describe('getLecturesByLessonId', () => {
    it('should fetch lectures for a lesson', async () => {
      httpMock.get.mockReturnValue(of({ lectures: [mockLecture] }));

      const result = await firstValueFrom(service.getLecturesByLessonId('lesson-123'));

      expect(result).toEqual([mockLecture]);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/lessons/lesson-123/lectures`,
      );
    });
  });

  describe('getAssessmentsByCourseId', () => {
    it('should fetch assessments for a course', async () => {
      httpMock.get.mockReturnValue(of({ assessments: [mockAssessment] }));

      const result = await firstValueFrom(service.getAssessmentsByCourseId('course-123'));

      expect(result).toEqual([mockAssessment]);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/courses/course-123/assessments`,
      );
    });

    it('should parse JSON fields in assessments', async () => {
      const assessmentWithJsonStrings = {
        ...mockAssessment,
        questionsJson: JSON.stringify(['Q1', 'Q2']),
        answerKeyJson: JSON.stringify(['A1', 'A2']),
        rubricJson: JSON.stringify(['C1', 'C2']),
      };
      httpMock.get.mockReturnValue(of({ assessments: [assessmentWithJsonStrings] }));

      const result = await firstValueFrom(service.getAssessmentsByCourseId('course-123'));

      expect(result[0].questions).toEqual(['Q1', 'Q2']);
      expect(result[0].answerKey).toEqual(['A1', 'A2']);
      expect(result[0].rubricCriteria).toEqual(['C1', 'C2']);
    });
  });

  describe('getAssessmentDetails', () => {
    it('should fetch assessment details', async () => {
      httpMock.get.mockReturnValue(of(mockAssessment));

      const result = await firstValueFrom(service.getAssessmentDetails('assessment-123'));

      expect(result).toEqual(mockAssessment);
      expect(httpMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/assessments/assessment-123/details`,
      );
    });
  });

  describe('createLesson', () => {
    it('should create a new lesson', async () => {
      const payload: CreateLessonRequest = {
        courseId: 'course-123',
        title: 'New Lesson',
        content: 'New Content',
      };
      httpMock.post.mockReturnValue(of(mockLesson));

      const result = await firstValueFrom(service.createLesson(payload));

      expect(result).toEqual(mockLesson);
      expect(httpMock.post).toHaveBeenCalledWith(`${environment.apiUrl}/lessons`, payload);
    });
  });

  describe('updateLesson', () => {
    it('should update a lesson', async () => {
      const payload = { title: 'Updated Lesson' };
      httpMock.patch.mockReturnValue(of({ ...mockLesson, ...payload }));

      const result = await firstValueFrom(service.updateLesson('lesson-123', payload));

      expect(result.title).toBe('Updated Lesson');
      expect(httpMock.patch).toHaveBeenCalledWith(
        `${environment.apiUrl}/lessons/lesson-123`,
        payload,
      );
    });
  });

  describe('deleteLesson', () => {
    it('should delete a lesson', async () => {
      httpMock.delete.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.deleteLesson('lesson-123'));

      expect(result).toBeUndefined();
      expect(httpMock.delete).toHaveBeenCalledWith(`${environment.apiUrl}/lessons/lesson-123`);
    });
  });

  describe('createLecture', () => {
    it('should create a new lecture', async () => {
      const payload: CreateLectureRequest = {
        lessonId: 'lesson-123',
        title: 'New Lecture',
        videoUrl: 'https://example.com/video.mp4',
        content: 'Lecture content',
      };
      httpMock.post.mockReturnValue(of(mockLecture));

      const result = await firstValueFrom(service.createLecture(payload));

      expect(result).toEqual(mockLecture);
      expect(httpMock.post).toHaveBeenCalledWith(`${environment.apiUrl}/lectures`, payload);
    });
  });

  describe('updateLecture', () => {
    it('should update a lecture', async () => {
      const payload = { title: 'Updated Lecture' };
      httpMock.patch.mockReturnValue(of({ ...mockLecture, ...payload }));

      const result = await firstValueFrom(service.updateLecture('lecture-123', payload));

      expect(result.title).toBe('Updated Lecture');
      expect(httpMock.patch).toHaveBeenCalledWith(
        `${environment.apiUrl}/lectures/lecture-123`,
        payload,
      );
    });
  });

  describe('deleteLecture', () => {
    it('should delete a lecture', async () => {
      httpMock.delete.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.deleteLecture('lecture-123'));

      expect(result).toBeUndefined();
      expect(httpMock.delete).toHaveBeenCalledWith(`${environment.apiUrl}/lectures/lecture-123`);
    });
  });

  describe('createAssessment', () => {
    it('should create a new assessment', async () => {
      const payload: CreateAssessmentRequest = {
        courseId: 'course-123',
        lessonId: 'lesson-123',
        title: 'New Assessment',
        description: 'New Description',
        questions: ['Q1', 'Q2'],
        answerKey: ['A1', 'A2'],
        rubricCriteria: ['C1', 'C2'],
      };
      httpMock.post.mockReturnValue(of(mockAssessment));

      const result = await firstValueFrom(service.createAssessment(payload));

      expect(result).toEqual(mockAssessment);
      expect(httpMock.post).toHaveBeenCalledWith(`${environment.apiUrl}/assessments`, payload);
    });
  });

  describe('updateAssessment', () => {
    it('should update an assessment', async () => {
      const payload = { title: 'Updated Assessment' };
      httpMock.patch.mockReturnValue(of({ ...mockAssessment, ...payload }));

      const result = await firstValueFrom(service.updateAssessment('assessment-123', payload));

      expect(result.title).toBe('Updated Assessment');
      expect(httpMock.patch).toHaveBeenCalledWith(
        `${environment.apiUrl}/assessments/assessment-123`,
        payload,
      );
    });
  });

  describe('deleteAssessment', () => {
    it('should delete an assessment', async () => {
      httpMock.delete.mockReturnValue(of(undefined));

      const result = await firstValueFrom(service.deleteAssessment('assessment-123'));

      expect(result).toBeUndefined();
      expect(httpMock.delete).toHaveBeenCalledWith(
        `${environment.apiUrl}/assessments/assessment-123`,
      );
    });
  });

  describe('generateAssessmentDraft', () => {
    it('should generate an assessment draft', async () => {
      const payload = {
        courseId: 'course-123',
        lessonId: 'lesson-123',
        questionCount: 5,
        difficulty: 'MEDIUM' as const,
      };
      const mockDraft: AssessmentDraftResponse = {
        title: 'Generated Assessment',
        description: 'Generated Description',
        questions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
        answerKey: ['A1', 'A2', 'A3', 'A4', 'A5'],
        rubricCriteria: ['C1', 'C2', 'C3'],
      };
      httpMock.post.mockReturnValue(of(mockDraft));

      const result = await firstValueFrom(service.generateAssessmentDraft(payload));

      expect(result).toEqual(mockDraft);
      expect(httpMock.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/assessments/generate`,
        payload,
      );
    });
  });

  describe('createAssessmentFromDraft', () => {
    it('should create assessment from draft', async () => {
      const payload = {
        courseId: 'course-123',
        lessonId: 'lesson-123',
        title: 'Draft Assessment',
        description: 'Draft Description',
        questions: ['Q1', 'Q2'],
        answerKey: ['A1', 'A2'],
        rubricCriteria: ['C1', 'C2'],
      };
      httpMock.post.mockReturnValue(of(mockAssessment));

      const result = await firstValueFrom(service.createAssessmentFromDraft(payload));

      expect(result).toEqual(mockAssessment);
      expect(httpMock.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/assessments/from-draft`,
        payload,
      );
    });
  });

  describe('error handling', () => {
    it('should handle getLessonsByCourseId error', async () => {
      const error = new Error('Not found');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getLessonsByCourseId('invalid-id').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Not found');
            resolve();
          },
        });
      });
    });

    it('should handle createLesson error', async () => {
      const error = new Error('Validation failed');
      httpMock.post.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.createLesson({ courseId: 'course-123', title: '', content: '' }).subscribe({
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
