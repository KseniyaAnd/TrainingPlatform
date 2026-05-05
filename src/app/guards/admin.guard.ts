import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStateService } from '../services/auth/auth-state.service';

export const adminGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const role = authState.role();

  if (role === 'ADMIN') {
    return true;
  }

  // Redirect to home if not admin
  void router.navigate(['/']);
  return false;
};
