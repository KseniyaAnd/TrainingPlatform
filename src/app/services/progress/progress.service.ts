import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiStudyPlanResponse, CourseStudentAnalyticsResponse } from '../../models/analytics.model';
import { CourseProgressResponse } from '../../models/progress.model';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);

  /**
   * Get student's progress for a specific course
   */
  getCourseProgress(courseId: string): Observable<CourseProgressResponse> {
    return this.http.get<CourseProgressResponse>(
      `${environment.apiUrl}/courses/${courseId}/progress/me`,
    );
  }

  /**
   * Mark a lecture as completed
   */
  markLectureCompleted(
    courseId: string,
    userId: string,
    lectureId: string,
  ): Observable<CourseProgressResponse> {
    const url = `${environment.apiUrl}/courses/${courseId}/users/${userId}/progress/lectures/${lectureId}`;
    console.log('ProgressService.markLectureCompleted - URL:', url);

    return this.http.put<CourseProgressResponse>(url, { completed: true });
  }

  /**
   * Get AI-powered student analytics for a course (teacher/admin only)
   */
  getCourseStudentAnalytics(courseId: string): Observable<CourseStudentAnalyticsResponse> {
    return this.http.get<CourseStudentAnalyticsResponse>(
      `${environment.apiUrl}/courses/${courseId}/ai/student-analytics`,
    );
  }

  /**
   * Get AI-generated study plan for a specific student (teacher/admin only)
   */
  getStudentAiStudyPlan(courseId: string, studentId: string): Observable<AiStudyPlanResponse> {
    return this.http.get<AiStudyPlanResponse>(
      `${environment.apiUrl}/courses/${courseId}/students/${studentId}/ai-study-plan`,
    );
  }
}
