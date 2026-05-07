import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenResponse } from '../../models/auth/auth.model';
import { UsersService } from '../users/users.service';
import { AuthStateService } from './auth-state.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpClientMock: { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };
  let authStateServiceMock: {
    setAuth: ReturnType<typeof vi.fn>;
    state: ReturnType<typeof vi.fn>;
  };
  let usersServiceMock: { getCurrentUser: ReturnType<typeof vi.fn> };

  const mockTokenResponse: TokenResponse = {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0ZXN0dXNlciIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJTVFVERU5UIl19fQ.test',
  };

  const mockUserProfile = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(() => {
    localStorage.clear();

    httpClientMock = {
      post: vi.fn(),
      get: vi.fn(),
    };

    authStateServiceMock = {
      setAuth: vi.fn(),
      state: vi.fn().mockReturnValue({
        isAuthenticated: false,
        accessToken: null,
        username: null,
        role: null,
        userId: null,
      }),
    };

    usersServiceMock = {
      getCurrentUser: vi.fn().mockReturnValue(of(mockUserProfile)),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpClientMock },
        { provide: AuthStateService, useValue: authStateServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  describe('login', () => {
    it('should successfully login and store token', async () => {
      httpClientMock.post.mockReturnValue(of(mockTokenResponse));

      const payload = await firstValueFrom(service.login('testuser', 'password'));

      expect(payload.preferred_username).toBe('testuser');
      expect(localStorage.getItem('accessToken')).toBe(mockTokenResponse.accessToken);
      expect(authStateServiceMock.setAuth).toHaveBeenCalled();
      expect(usersServiceMock.getCurrentUser).toHaveBeenCalled();
    });

    it('should parse JWT token correctly', () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0ZXN0dXNlciIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJTVFVERU5UIl19fQ.test';
      const payload = service.parseToken(token);

      expect(payload.preferred_username).toBe('testuser');
      expect(payload.realm_access?.roles).toContain('STUDENT');
    });

    it('should set correct role from token', async () => {
      httpClientMock.post.mockReturnValue(of(mockTokenResponse));

      await firstValueFrom(service.login('testuser', 'password'));

      const setAuthCalls = authStateServiceMock.setAuth.mock.calls;
      const firstCall = setAuthCalls[0][0];
      expect(firstCall.role).toBe('STUDENT');
    });
  });

  describe('logout', () => {
    it('should clear token and auth state', () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('auth:user', '{}');

      service.logout();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('auth:user')).toBeNull();
      expect(authStateServiceMock.setAuth).toHaveBeenCalledWith({
        isAuthenticated: false,
        accessToken: null,
        username: null,
        role: null,
        userId: null,
      });
    });
  });

  describe('getAccessToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('accessToken', 'test-token');
      expect(service.getAccessToken()).toBe('test-token');
    });

    it('should return null if no token exists', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should fallback to auth:state if accessToken key not found', () => {
      localStorage.setItem('auth:state', JSON.stringify({ accessToken: 'fallback-token' }));
      expect(service.getAccessToken()).toBe('fallback-token');
    });
  });

  describe('parseToken', () => {
    it('should handle tokens with special characters', () => {
      const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoidGVzdCIsInJvbGUiOiJBRE1JTiJ9.signature';
      const payload = service.parseToken(token);
      expect(payload).toBeDefined();
    });
  });
});
