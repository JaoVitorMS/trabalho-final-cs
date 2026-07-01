import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Role } from './core/models/usuario.model';

/**
 * Rotas com lazy loading (loadComponent) e controle de acesso por perfil
 * (authGuard + data.roles), conforme a tabela de rotas do ADR-001.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'OpenSARC — Painel de Recursos',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'login',
    title: 'Entrar — OpenSARC',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'cadastro',
    title: 'Cadastrar usuário — OpenSARC',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'reservas',
    title: 'Minhas reservas — OpenSARC',
    canActivate: [authGuard],
    data: { roles: [Role.PROFESSOR, Role.SECRETARIO, Role.ADMIN] },
    loadComponent: () =>
      import('./features/bookings/booking-list/booking-list.component').then(
        (m) => m.BookingListComponent,
      ),
  },
  {
    path: 'reservas/nova',
    title: 'Nova reserva — OpenSARC',
    canActivate: [authGuard],
    data: { roles: [Role.PROFESSOR, Role.SECRETARIO, Role.ADMIN] },
    loadComponent: () =>
      import('./features/bookings/booking-new/booking-new.component').then(
        (m) => m.BookingNewComponent,
      ),
  },
  {
    path: 'agenda',
    title: 'Agenda — OpenSARC',
    canActivate: [authGuard],
    data: { roles: [Role.PROFESSOR, Role.SECRETARIO, Role.ADMIN] },
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(
        (m) => m.CalendarComponent,
      ),
  },
  {
    path: 'admin/recursos',
    title: 'Recursos — Administração',
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN] },
    loadComponent: () =>
      import('./features/admin/resources/admin-resources.component').then(
        (m) => m.AdminResourcesComponent,
      ),
  },
  {
    path: 'admin/usuarios',
    title: 'Usuários — Administração',
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN] },
    loadComponent: () =>
      import('./features/admin/users/admin-users.component').then(
        (m) => m.AdminUsersComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
