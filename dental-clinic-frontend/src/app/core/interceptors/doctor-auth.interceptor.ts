import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { DoctorAuthService } from '../services/doctor-auth.service';

export const doctorAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(DoctorAuthService);

  if (!req.url.includes('/api/doctor-portal')) {
    return next(req);
  }

  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = authService.getToken();
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
