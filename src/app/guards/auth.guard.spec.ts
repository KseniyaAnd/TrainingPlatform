import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authStateService: jasmine.SpyObj<AuthStateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authStateServiceSpy = jasmine.createSpyObj('AuthStateService', ['isAuthenticated']);
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

  it('should allow access when user is authenticated', () => {
    authStateService.isAuthenticated.and.returnValue(true);

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/courses' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    authStateService.isAuthenticated.and.returnValue(false);

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/courses' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/courses' },
    });
  });

  it('should preserve the original URL in returnUrl query param', () => {
    authStateService.isAuthenticated.and.returnValue(false);

    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/courses/123' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/courses/123' },
    });
  });
});
