import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Assessment, parseAssessmentJsonFields } from '../../models/assessment.model';
import { Lecture } from '../../models/lecture.model';
import { Lesson } from '../../models/lesson.model';

export interface CreateLessonRequest {
  courseId: string;
  title: string;
  content: string;
}

export type UpdateLessonRequest = Partial<Omit<CreateLessonRequest, 'courseId'>>;

export interface CreateLectureRequest {
  lessonId: string;
  title: string;
  videoUrl?: string | null;
  content?: string | null;
}

export type UpdateLectureRequest = Partial<Omit<CreateLectureRequest, 'lessonId'>>;

export interface CreateAssessmentRequest {
  courseId: string;
  lessonId?: string;
  lectureId?: string;
  title: string;
  description: string;
  questions: string[];
  answerKey: string[];
  rubricCriteria: string[];
}

export type UpdateAssessmentRequest = Partial<
  Omit<CreateAssessmentRequest, 'courseId' | 'lessonId' | 'lectureId'>
>;

export type AssessmentDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GenerateAssessmentDraftRequest {
  courseId: string;
  sourceType: 'LESSON' | 'LECTURE';
  sourceId?: string;
  questionCount: number;
  difficulty: AssessmentDifficulty;
}

export interface AssessmentDraftResponse {
  title: string;
  description: string;
  questions: string[];
  answerKey: string[];
  rubricCriteria: string[];
}

export interface CreateAssessmentFromDraftRequest {
  courseId: string;
  lessonId: string;
  title: string;
  description: string;
  questions: string[];
  answerKey: string[];
  rubricCriteria: string[];
}

function normalizeArrayResponse<T>(r: unknown, keys: Array<string> = []): T[] {
  if (Array.isArray(r)) return r as T[];

  if (r && typeof r === 'object') {
    const obj = r as Record<string, unknown>;

    for (const k of keys) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }

    const items = obj['items'];
    if (Array.isArray(items)) return items as T[];
  }

  return [];
}

@Injectable({ providedIn: 'root' })
export class CourseContentService {
  private readonly http = inject(HttpClient);

  getLessonsByCourseId(courseId: string): Observable<Lesson[]> {
    return this.http
      .get<unknown>(`${environment.apiUrl}/courses/${courseId}/lessons`)
      .pipe(map((r) => normalizeArrayResponse<Lesson>(r, ['lessons'])));
  }

  getLecturesByLessonId(lessonId: string): Observable<Lecture[]> {
    return this.http
      .get<unknown>(`${environment.apiUrl}/lessons/${lessonId}/lectures`)
      .pipe(map((r) => normalizeArrayResponse<Lecture>(r, ['lectures'])));
  }

  getAssessmentsByCourseId(courseId: string): Observable<Assessment[]> {
    return this.http.get<unknown>(`${environment.apiUrl}/courses/${courseId}/assessments`).pipe(
      map((r): Assessment[] => {
        console.log('🌐 Сырой ответ API /courses/{courseId}/assessments:', r);
        const normalized = normalizeArrayResponse<Assessment>(r, ['assessments']);
        console.log('📦 Нормализованные ассесменты (до парсинга):', normalized);
        // Парсим JSON-поля в массивы
        const parsed = normalized.map(parseAssessmentJsonFields);
        console.log('✅ Ассесменты после парсинга JSON-полей:', parsed);
        return parsed;
      }),
    );
  }

  getAssessmentDetails(assessmentId: string): Observable<Assessment> {
    return this.http
      .get<Assessment>(`${environment.apiUrl}/assessments/${assessmentId}/details`)
      .pipe(
        map((assessment) => {
          console.log('🌐 Сырой ответ API /assessments/{id}/details:', assessment);
          const parsed = parseAssessmentJsonFields(assessment);
          console.log('✅ Ассесмент после парсинга JSON-полей:', parsed);
          return parsed;
        }),
      );
  }

  createLesson(payload: CreateLessonRequest): Observable<Lesson> {
    return this.http.post<Lesson>(`${environment.apiUrl}/lessons`, payload);
  }

  updateLesson(lessonId: string, payload: UpdateLessonRequest): Observable<Lesson> {
    return this.http.patch<Lesson>(`${environment.apiUrl}/lessons/${lessonId}`, payload);
  }

  deleteLesson(lessonId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/lessons/${lessonId}`);
  }

  createLecture(payload: CreateLectureRequest): Observable<Lecture> {
    return this.http.post<Lecture>(`${environment.apiUrl}/lectures`, payload);
  }

  updateLecture(lectureId: string, payload: UpdateLectureRequest): Observable<Lecture> {
    return this.http.patch<Lecture>(`${environment.apiUrl}/lectures/${lectureId}`, payload);
  }

  deleteLecture(lectureId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/lectures/${lectureId}`);
  }

  createAssessment(payload: CreateAssessmentRequest): Observable<Assessment> {
    return this.http
      .post<Assessment>(`${environment.apiUrl}/assessments`, payload)
      .pipe(map(parseAssessmentJsonFields));
  }

  updateAssessment(assessmentId: string, payload: UpdateAssessmentRequest): Observable<Assessment> {
    return this.http
      .patch<Assessment>(`${environment.apiUrl}/assessments/${assessmentId}`, payload)
      .pipe(map(parseAssessmentJsonFields));
  }

  deleteAssessment(assessmentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/assessments/${assessmentId}`);
  }

  generateAssessmentDraft(
    payload: GenerateAssessmentDraftRequest,
  ): Observable<AssessmentDraftResponse> {
    console.log('📡 CourseContentService.generateAssessmentDraft вызван с payload:', payload);
    return this.http
      .post<AssessmentDraftResponse>(`${environment.apiUrl}/assessments/generate`, payload)
      .pipe(
        map((response) => {
          console.log('✅ Ответ от /assessments/generate:', response);
          return response;
        }),
      );
  }

  createAssessmentFromDraft(payload: CreateAssessmentFromDraftRequest): Observable<Assessment> {
    return this.http
      .post<Assessment>(`${environment.apiUrl}/assessments/from-draft`, payload)
      .pipe(map(parseAssessmentJsonFields));
  }
}
