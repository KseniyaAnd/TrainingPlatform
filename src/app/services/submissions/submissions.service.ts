import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssessmentsPageResponse,
  AssessmentStudentResponse,
  CreateSubmissionRequest,
  parseAssessmentStudentJsonFields,
  SubmissionResponse,
  SubmissionsPageResponse,
} from '../../models/submission.model';

@Injectable({ providedIn: 'root' })
export class SubmissionsService {
  private readonly http = inject(HttpClient);

  /**
   * Get assessments for a course (student view)
   */
  getCourseAssessments(courseId: string): Observable<AssessmentStudentResponse[]> {
    return this.http
      .get<AssessmentsPageResponse>(`${environment.apiUrl}/courses/${courseId}/assessments`)
      .pipe(
        map((response): AssessmentStudentResponse[] => {
          console.log('getCourseAssessments response:', response);
          console.log('getCourseAssessments response type:', typeof response);
          console.log('getCourseAssessments response.items:', response.items);
          console.log('getCourseAssessments response.items type:', typeof response.items);
          console.log('getCourseAssessments response.items length:', response.items?.length);

          // Проверка на случай, если items это не массив
          if (!response.items || !Array.isArray(response.items)) {
            console.error('getCourseAssessments: items is not an array!', response);
            return [];
          }

          // Парсим JSON-поля в массивы
          const parsed = response.items.map(parseAssessmentStudentJsonFields);
          console.log('✅ Студенческие ассесменты после парсинга JSON-полей:', parsed);
          return parsed;
        }),
      );
  }

  /**
   * Get all submissions for the current student
   */
  getMySubmissions(): Observable<SubmissionResponse[]> {
    return this.http.get<SubmissionsPageResponse>(`${environment.apiUrl}/submissions/me`).pipe(
      map((response) => {
        console.log('getMySubmissions response:', response);
        console.log('getMySubmissions items:', response.items);
        return response.items;
      }),
    );
  }

  /**
   * Create a new submission
   */
  createSubmission(payload: CreateSubmissionRequest): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${environment.apiUrl}/submissions`, payload);
  }

  /**
   * Get all submissions for a specific assessment (for teachers)
   */
  getAssessmentSubmissions(
    assessmentId: string,
    limit?: number,
    cursor?: string,
  ): Observable<SubmissionsPageResponse> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (cursor) {
      params = params.set('cursor', cursor);
    }

    return this.http.get<SubmissionsPageResponse>(
      `${environment.apiUrl}/submissions/assessment/${assessmentId}`,
      { params },
    );
  }

  /**
   * Grade a student's submission (PATCH method)
   */
  gradeSubmission(submissionId: string, score: number): Observable<SubmissionResponse> {
    const body = { score };
    console.log('Grading submission (PATCH):', { submissionId, body });
    return this.http.patch<SubmissionResponse>(
      `${environment.apiUrl}/submissions/${submissionId}`,
      body,
    );
  }
}
