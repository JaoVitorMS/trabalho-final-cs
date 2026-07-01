import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Tratamento global de erros HTTP (ADR-001):
 * 401 → encerra sessão e vai para /login · 403 → redireciona para /login.
 * Demais erros geram um toast amigável.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const notifier = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          notifier.error(
            'Não foi possível conectar ao servidor. Verifique se o backend está em execução.',
          );
          break;
        case 401:
          auth.logout();
          router.navigate(['/login']);
          notifier.error('Sessão expirada. Faça login novamente.');
          break;
        case 403:
          router.navigate(['/login']);
          notifier.error('Acesso negado.');
          break;
        default:
          notifier.error(resolveMessage(error));
      }
      return throwError(() => error);
    }),
  );
};

function resolveMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }
  if (error.error?.message) {
    return error.error.message;
  }
  return error.message || 'Erro inesperado ao comunicar com o servidor.';
}
