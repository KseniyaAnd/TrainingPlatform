import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let authStateService: jasmine.SpyObj<AuthStateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authStateServiceSpy = jasmine.createSpyObj('AuthStateService', ['role']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStateService, useValue: authStateServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authStateService = TestBed.inject(AuthStateService) as jasmine.SpyObj<AuthStateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access when user role is in allowed roles', () => {
    authStateService.role.and.returnValue('TEACHER');

    const route = {
      data: { roles: ['TEACHER', 'ADMIN'] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access when no roles are specified', () => {
    authStateService.role.and.returnValue('STUDENT');

    const route = {
      data: {},
    } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access when roles array is empty', () => {
    authStateService.role.and.returnValue('STUDENT');

    const route = {
      data: { roles: [] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to home when user role is not in allowed roles', () => {
    authStateService.role.and.returnValue('STUDENT');

    const route = {
      data: { roles: ['TEACHER', 'ADMIN'] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to home when user has no role', () => {
    authStateService.role.and.returnValue(null);

    const route = {
      data: { roles: ['TEACHER', 'ADMIN'] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should allow ADMIN access to ADMIN-only routes', () => {
    authStateService.role.and.returnValue('ADMIN');

    const route = {
      data: { roles: ['ADMIN'] },
    } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
