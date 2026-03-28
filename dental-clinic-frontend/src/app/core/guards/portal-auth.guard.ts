import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PortalAuthService } from '../services/portal-auth.service';

export const portalAuthGuard: CanActivateFn = (_route, state) => {
  const authService = inject(PortalAuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/portal/login'], {
    queryParams: { returnUrl: state.url }
  });
};
