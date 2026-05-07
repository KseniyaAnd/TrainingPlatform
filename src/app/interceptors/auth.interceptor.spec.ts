import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/auth/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let authServiceMock: {
    getAccessToken: ReturnType<typeof vi.fn>;
    parseToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigateByUrl: ReturnType<typeof vi.fn> };
  let nextMock: HttpHandlerFn;

  beforeEach(() => {
    authServiceMock = {
      getAccessToken: vi.fn(),
      parseToken: vi.fn(),
      logout: vi.fn(),
    };

    routerMock = {
      navigateByUrl: vi.fn().mockResolvedValue(true),
    };

    nextMock = vi.fn().mockReturnValue(of({ status: 200 }));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should pass request without token if not authenticated', () => {
    authServiceMock.getAccessToken.mockReturnValue(null);

    const req = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, nextMock);
    });

    expect(nextMock).toHaveBeenCalledWith(req);
  });

  it('should add Authorization header when token exists', () => {
    const token = 'valid-token';
    authServiceMock.getAccessToken.mockReturnValue(token);
    authServiceMock.parseToken.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const req = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, nextMock);
    });

    const clonedReq = (nextMock as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as HttpRequest<unknown>;
    expect(clonedReq.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should logout and redirect if token is expired', () => {
    const expiredToken = 'expired-token';
    authServiceMock.getAccessToken.mockReturnValue(expiredToken);
    authServiceMock.parseToken.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 3600 });

    const req = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, nextMock);
    });

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should logout and redirect on 401 error', async () => {
    const token = 'valid-token';
    authServiceMock.getAccessToken.mockReturnValue(token);
    authServiceMock.parseToken.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const error = new HttpErrorResponse({ status: 401 });
    nextMock = vi.fn().mockReturnValue(throwError(() => error));

    const req = new HttpRequest('GET', '/api/test');

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        authInterceptor(req, nextMock).subscribe({
          error: () => {
            expect(authServiceMock.logout).toHaveBeenCalled();
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
            resolve();
          },
        });
      });
    });
  });

  it('should handle invalid token gracefully', () => {
    authServiceMock.getAccessToken.mockReturnValue('invalid-token');
    authServiceMock.parseToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, nextMock);
    });

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('should not logout on non-401 errors', async () => {
    const token = 'valid-token';
    authServiceMock.getAccessToken.mockReturnValue(token);
    authServiceMock.parseToken.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const error = new HttpErrorResponse({ status: 500 });
    nextMock = vi.fn().mockReturnValue(throwError(() => error));

    const req = new HttpRequest('GET', '/api/test');

    await new Promise<void>((resolve) => {
      TestBed.runInInjectionContext(() => {
        authInterceptor(req, nextMock).subscribe({
          error: () => {
            expect(authServiceMock.logout).not.toHaveBeenCalled();
            resolve();
          },
        });
      });
    });
  });
});
