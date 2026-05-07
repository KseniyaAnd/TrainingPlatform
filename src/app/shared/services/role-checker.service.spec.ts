import { TestBed } from '@angular/core/testing';

import { AuthStateService } from '../../services/auth/auth-state.service';
import { RoleCheckerService } from './role-checker.service';

describe('RoleCheckerService', () => {
  let service: RoleCheckerService;
  let authStateService: jasmine.SpyObj<AuthStateService>;

  beforeEach(() => {
    const authStateServiceSpy = jasmine.createSpyObj('AuthStateService', [
      'role',
      'isAuthenticated',
      'username',
      'getUserId',
    ]);

    TestBed.configureTestingModule({
      providers: [RoleCheckerService, { provide: AuthStateService, useValue: authStateServiceSpy }],
    });

    service = TestBed.inject(RoleCheckerService);
    authStateService = TestBed.inject(AuthStateService) as jasmine.SpyObj<AuthStateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('role checks', () => {
    it('should identify admin role', () => {
      authStateService.role.and.returnValue('ADMIN');
      expect(service.isAdmin()).toBe(true);
      expect(service.isTeacher()).toBe(false);
      expect(service.isStudent()).toBe(false);
    });

    it('should identify teacher role', () => {
      authStateService.role.and.returnValue('TEACHER');
      expect(service.isAdmin()).toBe(false);
      expect(service.isTeacher()).toBe(true);
      expect(service.isStudent()).toBe(false);
    });

    it('should identify student role', () => {
      authStateService.role.and.returnValue('STUDENT');
      expect(service.isAdmin()).toBe(false);
      expect(service.isTeacher()).toBe(false);
      expect(service.isStudent()).toBe(true);
    });
  });

  describe('canManageCourses', () => {
    it('should return true for TEACHER', () => {
      authStateService.role.and.returnValue('TEACHER');
      expect(service.canManageCourses()).toBe(true);
    });

    it('should return true for ADMIN', () => {
      authStateService.role.and.returnValue('ADMIN');
      expect(service.canManageCourses()).toBe(true);
    });

    it('should return false for STUDENT', () => {
      authStateService.role.and.returnValue('STUDENT');
      expect(service.canManageCourses()).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has one of the specified roles', () => {
      authStateService.role.and.returnValue('TEACHER');
      expect(service.hasAnyRole(['TEACHER', 'ADMIN'])).toBe(true);
    });

    it('should return false when user does not have any of the specified roles', () => {
      authStateService.role.and.returnValue('STUDENT');
      expect(service.hasAnyRole(['TEACHER', 'ADMIN'])).toBe(false);
    });

    it('should return false when user has no role', () => {
      authStateService.role.and.returnValue(null);
      expect(service.hasAnyRole(['TEACHER', 'ADMIN'])).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      authStateService.role.and.returnValue('ADMIN');
      expect(service.hasRole('ADMIN')).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      authStateService.role.and.returnValue('STUDENT');
      expect(service.hasRole('ADMIN')).toBe(false);
    });
  });

  describe('getCurrentRole', () => {
    it('should return the current user role', () => {
      authStateService.role.and.returnValue('TEACHER');
      expect(service.getCurrentRole()).toBe('TEACHER');
    });

    it('should return null when user has no role', () => {
      authStateService.role.and.returnValue(null);
      expect(service.getCurrentRole()).toBeNull();
    });
  });
});
