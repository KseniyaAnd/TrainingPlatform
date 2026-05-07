import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../environments/environment';
import { PlatformStatistics, UserDetails } from '../../models/analytics.model';
import { User } from '../../models/user.model';
import { AdminService, UsersListResponse } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
  };

  const mockPlatformStats: PlatformStatistics = {
    usersCount: 150,
    coursesCount: 25,
    enrollmentsCount: 300,
    averageSubmissionScore: 85.5,
  };

  const mockUser: User = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'STUDENT',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockUserDetails: UserDetails = {
    user: mockUser,
    enrollments: [
      {
        id: 'enr-1',
        courseId: 'course-1',
        courseTitle: 'Test Course',
        enrolledAt: '2024-01-01T00:00:00Z',
        progress: 50,
      },
    ],
    enrolledCourses: [
      {
        id: 'course-1',
        title: 'Test Course',
        description: 'Test Description',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
    taughtCourses: [],
    submissions: [],
    createdAssessments: [],
  };

  const mockUsersListResponse: UsersListResponse = {
    items: [mockUser],
    nextCursor: null,
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [AdminService, { provide: HttpClient, useValue: httpMock }],
    });

    service = TestBed.inject(AdminService);
  });

  describe('getPlatformStatistics', () => {
    it('should fetch platform statistics', async () => {
      httpMock.get.mockReturnValue(of(mockPlatformStats));

      const result = await firstValueFrom(service.getPlatformStatistics());

      expect(result).toEqual(mockPlatformStats);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/platform-statistics`);
    });

    it('should return correct statistics structure', async () => {
      httpMock.get.mockReturnValue(of(mockPlatformStats));

      const result = await firstValueFrom(service.getPlatformStatistics());

      expect(result.usersCount).toBe(150);
      expect(result.coursesCount).toBe(25);
      expect(result.enrollmentsCount).toBe(300);
      expect(result.averageSubmissionScore).toBe(85.5);
    });
  });

  describe('getUsers', () => {
    it('should fetch users without filters', async () => {
      httpMock.get.mockReturnValue(of(mockUsersListResponse));

      const result = await firstValueFrom(service.getUsers());

      expect(result).toEqual(mockUsersListResponse);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/users`, {
        params: expect.any(Object),
      });
    });

    it('should fetch users with role filter', async () => {
      httpMock.get.mockReturnValue(of(mockUsersListResponse));

      const result = await firstValueFrom(service.getUsers({ role: 'STUDENT' }));

      expect(result).toEqual(mockUsersListResponse);
      expect(httpMock.get).toHaveBeenCalled();
    });

    it('should fetch users with pagination params', async () => {
      const responseWithCursor = { ...mockUsersListResponse, nextCursor: 'cursor-123' };
      httpMock.get.mockReturnValue(of(responseWithCursor));

      const result = await firstValueFrom(service.getUsers({ limit: 10, cursor: 'cursor-123' }));

      expect(result.nextCursor).toBe('cursor-123');
      expect(httpMock.get).toHaveBeenCalled();
    });

    it('should fetch users with all params', async () => {
      httpMock.get.mockReturnValue(of(mockUsersListResponse));

      const result = await firstValueFrom(
        service.getUsers({ role: 'TEACHER', limit: 20, cursor: 'cursor-456' }),
      );

      expect(result).toEqual(mockUsersListResponse);
      expect(httpMock.get).toHaveBeenCalled();
    });
  });

  describe('getUserDetails', () => {
    it('should fetch user details by ID', async () => {
      httpMock.get.mockReturnValue(of(mockUserDetails));

      const result = await firstValueFrom(service.getUserDetails('user-123'));

      expect(result).toEqual(mockUserDetails);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/users/user-123/details`);
    });

    it('should return complete user details structure', async () => {
      httpMock.get.mockReturnValue(of(mockUserDetails));

      const result = await firstValueFrom(service.getUserDetails('user-123'));

      expect(result.user).toBeDefined();
      expect(result.enrollments).toBeDefined();
      expect(result.enrolledCourses).toBeDefined();
      expect(result.taughtCourses).toBeDefined();
      expect(result.submissions).toBeDefined();
      expect(result.createdAssessments).toBeDefined();
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile by ID', async () => {
      httpMock.get.mockReturnValue(of(mockUser));

      const result = await firstValueFrom(service.getUserProfile('user-123'));

      expect(result).toEqual(mockUser);
      expect(httpMock.get).toHaveBeenCalledWith(`${environment.apiUrl}/users/user-123`);
    });

    it('should fetch different user roles', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      httpMock.get.mockReturnValue(of(adminUser));

      const result = await firstValueFrom(service.getUserProfile('admin-123'));

      expect(result.role).toBe('ADMIN');
    });
  });

  describe('error handling', () => {
    it('should handle getPlatformStatistics error', async () => {
      const error = new Error('Unauthorized');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getPlatformStatistics().subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Unauthorized');
            resolve();
          },
        });
      });
    });

    it('should handle getUsers error', async () => {
      const error = new Error('Forbidden');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getUsers().subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Forbidden');
            resolve();
          },
        });
      });
    });

    it('should handle getUserDetails error', async () => {
      const error = new Error('Not found');
      httpMock.get.mockReturnValue(throwError(() => error));

      await new Promise<void>((resolve, reject) => {
        service.getUserDetails('invalid-id').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (err) => {
            expect(err.message).toBe('Not found');
            resolve();
          },
        });
      });
    });
  });
});
