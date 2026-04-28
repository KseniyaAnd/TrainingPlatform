import { Injectable, signal } from '@angular/core';

const AUTH_STORAGE_KEY = 'auth:isAuthenticated';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  readonly isAuthenticated = signal<boolean>(
    localStorage.getItem(AUTH_STORAGE_KEY) === 'true',
  );

  setAuthenticated(value: boolean): void {
    this.isAuthenticated.set(value);
    localStorage.setItem(AUTH_STORAGE_KEY, value ? 'true' : 'false');
  }

  logout(): void {
    this.setAuthenticated(false);
  }
}
