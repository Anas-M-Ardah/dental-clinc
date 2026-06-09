import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DoctorAuthService } from '../services/doctor-auth.service';

export const doctorAuthGuard: CanActivateFn = (_route, state) => {
  const authService = inject(DoctorAuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/doctor/login'], {
    queryParams: { returnUrl: state.url }
  });
};
