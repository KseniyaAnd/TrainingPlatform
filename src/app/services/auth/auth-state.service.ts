import { Injectable, signal } from '@angular/core';

const AUTH_STORAGE_KEY = 'auth:state';

function pickAppRole(roles: string[] | undefined): string | null {
  if (!roles || roles.length === 0) return null;
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('TEACHER')) return 'TEACHER';
  if (roles.includes('STUDENT')) return 'STUDENT';
  return null;
}

function parseJwtPayload(token: string): unknown {
  const payload = token.split('.')[1];
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(normalized)) as unknown;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  username: string | null;
  role: string | null;
  userId: string | null; // Internal user ID from database
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  username: null,
  role: null,
  userId: null,
};

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly state = signal<AuthState>(this.readInitialState());

  readonly isAuthenticated = signal<boolean>(this.state().isAuthenticated);
  readonly username = signal<string | null>(this.state().username);
  readonly role = signal<string | null>(this.state().role);
  readonly userId = signal<string | null>(this.state().userId);

  setAuth(next: AuthState): void {
    this.state.set(next);
    this.isAuthenticated.set(next.isAuthenticated);
    this.username.set(next.username);
    this.role.set(next.role);
    this.userId.set(next.userId);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  }

  setAuthenticated(value: boolean): void {
    const current = this.state();
    this.setAuth({ ...current, isAuthenticated: value });
  }

  /**
   * Get the internal user ID from the auth state (from database, not Keycloak)
   */
  getUserId(): string | null {
    return this.state().userId;
  }

  /**
   * Get the Keycloak subject ID from the JWT token
   */
  getKeycloakSubject(): string | null {
    const token = this.state().accessToken;
    if (!token) return null;

    try {
      const payload = parseJwtPayload(token) as { sub?: string };
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  private readInitialState(): AuthState {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return defaultAuthState;
    try {
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      const next: AuthState = {
        ...defaultAuthState,
        ...parsed,
        isAuthenticated: Boolean(parsed.isAuthenticated),
      };

      const hasValidRole =
        next.role === 'ADMIN' || next.role === 'TEACHER' || next.role === 'STUDENT';
      if (!hasValidRole && next.accessToken) {
        try {
          const tokenPayload = parseJwtPayload(next.accessToken) as {
            realm_access?: { roles?: string[] };
            preferred_username?: string;
          };

          const roleFromToken = pickAppRole(tokenPayload.realm_access?.roles);
          if (roleFromToken) next.role = roleFromToken;
          if (tokenPayload.preferred_username) next.username = tokenPayload.preferred_username;
        } catch {
          // ignore token parsing issues; fallback to persisted state
        }
      }

      return next;
    } catch {
      return defaultAuthState;
    }
  }

  logout(): void {
    this.setAuth(defaultAuthState);
  }
}
