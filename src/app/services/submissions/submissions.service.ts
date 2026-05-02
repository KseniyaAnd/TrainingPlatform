import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssessmentsPageResponse,
  AssessmentStudentResponse,
  CreateSubmissionRequest,
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
      .pipe(map((response) => response.items));
  }

  /**
   * Get all submissions for the current student
   */
  getMySubmissions(): Observable<SubmissionResponse[]> {
    return this.http
      .get<SubmissionsPageResponse>(`${environment.apiUrl}/submissions/me`)
      .pipe(map((response) => response.items));
  }

  /**
   * Create a new submission
   */
  createSubmission(payload: CreateSubmissionRequest): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${environment.apiUrl}/submissions`, payload);
  }
}
