import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
}
