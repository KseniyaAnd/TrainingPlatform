import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { UsersService } from '../users/users.service';
import { AuthStateService } from './auth-state.service';

/**
 * Service to initialize auth state on app startup
 * Loads internal userId if user is authenticated but userId is missing
 */
@Injectable({ providedIn: 'root' })
export class AuthInitService {
  private readonly authState = inject(AuthStateService);
  private readonly usersService = inject(UsersService);

  /**
   * Initialize auth state - load userId if missing
   */
  initialize(): Observable<void> {
    const isAuthenticated = this.authState.isAuthenticated();
    const userId = this.authState.getUserId();

    // If authenticated but userId is missing, load it
    if (isAuthenticated && !userId) {
      return this.usersService.getCurrentUser().pipe(
        tap((userProfile) => {
          const currentState = this.authState['state']();
          this.authState.setAuth({
            ...currentState,
            userId: userProfile.id,
          });
        }),
        catchError((error) => {
          console.error('Failed to load user profile:', error);
          // Don't fail app initialization, just log the error
          return of(void 0);
        }),
        tap(() => {}),
        // Map to void to match return type
        tap(() => void 0) as any,
      ) as Observable<void>;
    }

    return of(void 0);
  }
}
