import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CourseListResponse } from '../../models/course.model';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly http = inject(HttpClient);

  getCourses(options?: { limit?: number; cursor?: string | null }): Observable<CourseListResponse> {
    let params = new HttpParams();

    if (options?.limit != null) {
      params = params.set('limit', String(options.limit));
    }

    if (options?.cursor) {
      params = params.set('cursor', options.cursor);
    }

    return this.http.get<CourseListResponse>(`${environment.apiUrl}/courses`, { params });
  }
}
