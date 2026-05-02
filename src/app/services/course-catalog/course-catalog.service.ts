import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseCatalogDetailsResponse } from '../../models/course-catalog.model';

@Injectable({ providedIn: 'root' })
export class CourseCatalogService {
  private readonly http = inject(HttpClient);

  getCourseCatalogDetails(courseId: string): Observable<CourseCatalogDetailsResponse> {
    return this.http.get<CourseCatalogDetailsResponse>(`${environment.apiUrl}/courses/${courseId}`);
  }
}
