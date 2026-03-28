import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { PortalAuthService } from '../services/portal-auth.service';

export const portalAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(PortalAuthService).getToken();

  if (token && req.url.includes('/api/portal')) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};
