import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '../services/auth.service';

/**
 * Injeta `Authorization: Bearer <token>` quando há sessão ativa.
 * A validação do token é feita no API Gateway (ADR-001).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
