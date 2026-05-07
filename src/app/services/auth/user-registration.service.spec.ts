import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { UserRegistrationRequest } from '../../models/auth/user-registration.model';
import { UserRegistrationService } from './user-registration.service';

describe('UserRegistrationService', () => {
  let service: UserRegistrationService;
  let httpMock: {
    post: ReturnType<typeof vi.fn>;
  };

  const mockRegistrationRequest: UserRegistrationRequest = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    role: 'STUDENT',
  };

  beforeEach(() => {
    httpMock = {
      post: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [UserRegistrationService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(UserRegistrationService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockResponse = { id: 'user-123', username: 'newuser' };
      httpMock.post.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.register(mockRegistrationRequest));

      expect(result).toEqual(mockResponse);
      expect(httpMock.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/user-registrations`,
        mockRegistrationRequest,
      );
    });

    it('should handle successful registration with minimal data', async () => {
      const minimalRequest: UserRegistrationRequest = {
        username: 'user',
        email: 'user@example.com',
        password: 'pass123',
        role: 'STUDENT',
      };
      httpMock.post.mockReturnValue(of({ success: true }));

      const result = await firstValueFrom(service.register(minimalRequest));

      expect(result).toEqual({ success: true });
      expect(httpMock.post).toHaveBeenCalledWith(
        `${environment.apiUrl}/user-registrations`,
        minimalRequest,
      );
    });
  });

  describe('error handling', () => {
    it('should handle registration error for duplicate username', async () => {
      const error = new Error('Username already exists');
      httpMock.post.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.register(mockRegistrationRequest).subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Username already exists');
            resolve();
          },
        });
      });
    });

    it('should handle registration error for invalid email', async () => {
      const error = new Error('Invalid email format');
      httpMock.post.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.register({ ...mockRegistrationRequest, email: 'invalid-email' }).subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Invalid email format');
            resolve();
          },
        });
      });
    });

    it('should handle registration error for weak password', async () => {
      const error = new Error('Password too weak');
      httpMock.post.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.register({ ...mockRegistrationRequest, password: '123' }).subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Password too weak');
            resolve();
          },
        });
      });
    });
  });
});
