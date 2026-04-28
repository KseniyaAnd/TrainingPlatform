import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { JwtPayload, TokenResponse } from '../../models/auth/auth.model';
import { AuthStateService } from './auth-state.service';

const ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_USER_KEY = 'auth:user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authStateService = inject(AuthStateService);

  login(username: string, password: string): Observable<JwtPayload> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/token`, body.toString(), { headers })
      .pipe(
        tap((response) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        }),
        map((response) => this.parseToken(response.accessToken)),
        tap((payload) => {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload));
          const usernameFromToken = payload.preferred_username ?? '';
          const role = payload.realm_access?.roles?.[0] ?? '';
          this.authStateService.setAuth({
            isAuthenticated: true,
            accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
            username: usernameFromToken,
            role,
          });
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.authStateService.setAuth({
      isAuthenticated: false,
      accessToken: null,
      username: null,
      role: null,
    });
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) return token;

    const raw = localStorage.getItem('auth:state');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { accessToken?: string | null };
      return parsed.accessToken ?? null;
    } catch {
      return null;
    }
  }

  parseToken(token: string): JwtPayload {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    return decoded as JwtPayload;
  }
}
