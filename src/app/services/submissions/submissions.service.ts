import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssessmentStudentResponse,
  CreateSubmissionRequest,
  SubmissionResponse,
} from '../../models/submission.model';

@Injectable({ providedIn: 'root' })
export class SubmissionsService {
  private readonly http = inject(HttpClient);

  /**
   * Get assessments for a course (student view)
   */
  getCourseAssessments(courseId: string): Observable<AssessmentStudentResponse[]> {
    return this.http.get<AssessmentStudentResponse[]>(
      `${environment.apiUrl}/courses/${courseId}/assessments/student`,
    );
  }

  /**
   * Get all submissions for the current student
   */
  getMySubmissions(): Observable<SubmissionResponse[]> {
    return this.http.get<SubmissionResponse[]>(`${environment.apiUrl}/submissions/me`);
  }

  /**
   * Create a new submission
   */
  createSubmission(payload: CreateSubmissionRequest): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${environment.apiUrl}/submissions`, payload);
  }
}
