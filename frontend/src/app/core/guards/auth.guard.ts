import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { Role } from '../models/usuario.model';

/**
 * Protege rotas por perfil (ADR-001). Lê `route.data.roles` e delega ao
 * AuthService. Sem autenticação → /login (guardando returnUrl). Autenticado
 * mas sem o perfil necessário → volta ao painel público.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notifier = inject(NotificationService);

  const roles = (route.data['roles'] as Role[] | undefined) ?? [];

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (!auth.hasAnyRole(roles)) {
    notifier.error('Você não tem permissão para acessar esta área.');
    return router.createUrlTree(['/']);
  }

  return true;
};
