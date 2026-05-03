import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PlatformStatistics, UserDetails } from '../../models/analytics.model';
import { User } from '../../models/user.model';

export interface UsersListParams {
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  limit?: number;
  cursor?: string;
}

export interface UsersListResponse {
  items: User[];
  nextCursor: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get platform-wide statistics (ADMIN only)
   */
  getPlatformStatistics(): Observable<PlatformStatistics> {
    return this.http.get<PlatformStatistics>(`${this.apiUrl}/platform-statistics`);
  }

  /**
   * Get list of all users with optional role filter
   */
  getUsers(params?: UsersListParams): Observable<UsersListResponse> {
    let httpParams = new HttpParams();

    if (params?.role) {
      httpParams = httpParams.set('role', params.role);
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }

    return this.http.get<UsersListResponse>(`${this.apiUrl}/users`, { params: httpParams });
  }

  /**
   * Get detailed information about a specific user
   */
  getUserDetails(userId: string): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.apiUrl}/users/${userId}/details`);
  }

  /**
   * Get user profile by ID
   */
  getUserProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }
}
