import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthStateService } from './auth-state.service';

describe('AuthStateService', () => {
  let service: AuthStateService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthStateService],
    });

    service = TestBed.inject(AuthStateService);
  });

  it('should create the service', () => {
    expect(service).toBeDefined();
  });

  it('should have initial unauthenticated state', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.username()).toBeNull();
    expect(service.role()).toBeNull();
    expect(service.userId()).toBeNull();
  });

  it('should update auth state', () => {
    const newState = {
      isAuthenticated: true,
      accessToken: 'test-token',
      username: 'testuser',
      role: 'STUDENT',
      userId: 'user-123',
    };

    service.setAuth(newState);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.username()).toBe('testuser');
    expect(service.role()).toBe('STUDENT');
    expect(service.userId()).toBe('user-123');
  });

  it('should persist state to localStorage', () => {
    const newState = {
      isAuthenticated: true,
      accessToken: 'test-token',
      username: 'testuser',
      role: 'STUDENT',
      userId: 'user-123',
    };

    service.setAuth(newState);

    const stored = localStorage.getItem('auth:state');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed.isAuthenticated).toBe(true);
    expect(parsed.username).toBe('testuser');
    expect(parsed.role).toBe('STUDENT');
    expect(parsed.userId).toBe('user-123');
  });

  it('should load state from localStorage on init', () => {
    const savedState = {
      isAuthenticated: true,
      accessToken: 'saved-token',
      username: 'saveduser',
      role: 'TEACHER',
      userId: 'user-456',
    };

    localStorage.setItem('auth:state', JSON.stringify(savedState));

    // Create new service instance to trigger initialization
    const newService = new AuthStateService();

    expect(newService.isAuthenticated()).toBe(true);
    expect(newService.username()).toBe('saveduser');
    expect(newService.role()).toBe('TEACHER');
    expect(newService.userId()).toBe('user-456');
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('auth:state', 'invalid-json');

    const newService = new AuthStateService();

    expect(newService.isAuthenticated()).toBe(false);
    expect(newService.username()).toBeNull();
    expect(newService.role()).toBeNull();
  });

  it('should clear auth state on logout', () => {
    service.setAuth({
      isAuthenticated: true,
      accessToken: 'test-token',
      username: 'testuser',
      role: 'STUDENT',
      userId: 'user-123',
    });

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.username()).toBeNull();
    expect(service.role()).toBeNull();
    expect(service.userId()).toBeNull();
  });

  it('should allow partial state updates', () => {
    service.setAuth({
      isAuthenticated: true,
      accessToken: 'test-token',
      username: 'testuser',
      role: 'STUDENT',
      userId: null,
    });

    expect(service.userId()).toBeNull();

    service.setAuth({
      isAuthenticated: true,
      accessToken: 'test-token',
      username: 'testuser',
      role: 'STUDENT',
      userId: 'user-123',
    });

    expect(service.userId()).toBe('user-123');
    expect(service.getUserId()).toBe('user-123');
  });
});
