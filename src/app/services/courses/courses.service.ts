import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Course, CourseListResponse } from '../../models/course.model';

export interface CreateCourseRequest {
  title: string;
  description: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly http = inject(HttpClient);

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${environment.apiUrl}/courses/${id}`);
  }

  getCourses(options?: {
    limit?: number;
    cursor?: string | null;
    q?: string | null;
  }): Observable<CourseListResponse> {
    let params = new HttpParams();

    if (options?.limit != null) {
      params = params.set('limit', String(options.limit));
    }

    if (options?.cursor) {
      params = params.set('cursor', options.cursor);
    }

    if (options?.q) {
      params = params.set('q', options.q);
    }

    return this.http.get<CourseListResponse>(`${environment.apiUrl}/courses`, { params });
  }

  getMyCourses(options?: {
    limit?: number;
    cursor?: string | null;
    q?: string | null;
  }): Observable<CourseListResponse> {
    let params = new HttpParams();

    if (options?.limit != null) {
      params = params.set('limit', String(options.limit));
    }

    if (options?.cursor) {
      params = params.set('cursor', options.cursor);
    }

    if (options?.q) {
      params = params.set('q', options.q);
    }

    return this.http.get<CourseListResponse>(`${environment.apiUrl}/courses/me`, { params });
  }

  createCourse(payload: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(`${environment.apiUrl}/courses`, payload);
  }
}
