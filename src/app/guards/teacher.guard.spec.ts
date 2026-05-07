import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';
import { teacherGuard } from './teacher.guard';

describe('teacherGuard', () => {
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

  it('should allow access when user is TEACHER', () => {
    authStateService.role.and.returnValue('TEACHER');

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => teacherGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access when user is ADMIN', () => {
    authStateService.role.and.returnValue('ADMIN');

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => teacherGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to home when user is STUDENT', () => {
    authStateService.role.and.returnValue('STUDENT');

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => teacherGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should redirect to home when user has no role', () => {
    authStateService.role.and.returnValue(null);

    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => teacherGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
