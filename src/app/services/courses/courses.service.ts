import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Course,
  CourseEnrollmentListResponse,
  CourseListResponse,
  CourseWithEnrollment,
} from '../../models/course.model';

export interface GetCourseByIdResponse {
  course: Course;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  tags: string[];
}

export interface EnrollmentResponse {
  enrollmentId: string;
  courseId: string;
  enrolledAt: string;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly http = inject(HttpClient);

  getCourseById(id: string): Observable<Course> {
    return this.http.get<unknown>(`${environment.apiUrl}/courses/${id}`).pipe(
      map((r) => {
        if (r && typeof r === 'object' && 'course' in r) {
          return (r as GetCourseByIdResponse).course;
        }

        return r as Course;
      }),
    );
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

  getEnrolledCourses(options?: {
    limit?: number;
    cursor?: string | null;
    q?: string | null;
  }): Observable<CourseEnrollmentListResponse> {
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

    return this.http.get<CourseEnrollmentListResponse>(
      `${environment.apiUrl}/courses/enrolled/me`,
      { params },
    );
  }

  loadCoursesWithEnrollmentStatus(options?: {
    limit?: number;
    cursor?: string | null;
    q?: string | null;
  }): Observable<CourseWithEnrollment[]> {
    return forkJoin({
      all: this.getCourses(options),
      enrolled: this.getEnrolledCourses({ limit: 200, cursor: null, q: null }),
    }).pipe(
      map(({ all, enrolled }) => {
        const enrollmentMap = new Map<string, string>();
        (enrolled.items ?? []).forEach((enrollment) => {
          enrollmentMap.set(enrollment.course.id, enrollment.enrollmentId);
        });

        return (all.items ?? []).map((course) => ({
          ...course,
          isEnrolled: enrollmentMap.has(course.id),
          enrollmentId: enrollmentMap.get(course.id) ?? null,
        }));
      }),
    );
  }

  createCourse(payload: CreateCourseRequest): Observable<Course> {
    return this.http.post<Course>(`${environment.apiUrl}/courses`, payload);
  }

  updateCourse(courseId: string, payload: UpdateCourseRequest): Observable<Course> {
    return this.http.patch<Course>(`${environment.apiUrl}/courses/${courseId}`, payload);
  }

  deleteCourse(courseId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/courses/${courseId}`);
  }

  enroll(courseId: string): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(`${environment.apiUrl}/enrollments`, { courseId });
  }

  unenroll(enrollmentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/enrollments/${enrollmentId}`);
  }
}
