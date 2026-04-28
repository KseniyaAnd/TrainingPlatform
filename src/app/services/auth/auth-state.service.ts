import { Injectable, signal } from '@angular/core';

const AUTH_STORAGE_KEY = 'auth:state';

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  username: string | null;
  role: string | null;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  username: null,
  role: null,
};

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly state = signal<AuthState>(this.readInitialState());

  readonly isAuthenticated = signal<boolean>(this.state().isAuthenticated);
  readonly username = signal<string | null>(this.state().username);
  readonly role = signal<string | null>(this.state().role);

  setAuth(next: AuthState): void {
    this.state.set(next);
    this.isAuthenticated.set(next.isAuthenticated);
    this.username.set(next.username);
    this.role.set(next.role);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  }

  setAuthenticated(value: boolean): void {
    const current = this.state();
    this.setAuth({ ...current, isAuthenticated: value });
  }

  private readInitialState(): AuthState {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return defaultAuthState;
    try {
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      return {
        ...defaultAuthState,
        ...parsed,
        isAuthenticated: Boolean(parsed.isAuthenticated),
      };
    } catch {
      return defaultAuthState;
    }
  }

  logout(): void {
    this.setAuth(defaultAuthState);
  }
}
