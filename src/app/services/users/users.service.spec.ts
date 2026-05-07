import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user.model';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
  };

  const mockUser: User = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'STUDENT',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [UsersService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(UsersService);
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', async () => {
      httpMock.get.mockReturnValue(of(mockUser));

      const result = await firstValueFrom(service.getCurrentUser());

      expect(result).toEqual(mockUser);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/users/me`);
    });

    it('should fetch user with TEACHER role', async () => {
      const teacherUser = { ...mockUser, role: 'TEACHER' };
      httpMock.get.mockReturnValue(of(teacherUser));

      const result = await firstValueFrom(service.getCurrentUser());

      expect(result.role).toBe('TEACHER');
    });

    it('should fetch user with ADMIN role', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      httpMock.get.mockReturnValue(of(adminUser));

      const result = await firstValueFrom(service.getCurrentUser());

      expect(result.role).toBe('ADMIN');
    });
  });

  describe('error handling', () => {
    it('should handle unauthorized error', async () => {
      const error = new Error('Unauthorized');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getCurrentUser().subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Unauthorized');
            resolve();
          },
        });
      });
    });

    it('should handle network error', async () => {
      const error = new Error('Network error');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getCurrentUser().subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Network error');
            resolve();
          },
        });
      });
    });
  });
});
