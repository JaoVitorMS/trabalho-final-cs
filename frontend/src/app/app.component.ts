import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { Role } from './core/models/usuario.model';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly notifier = inject(NotificationService);

  readonly user = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;

  private readonly allNavItems: NavItem[] = [
    { label: 'Painel', path: '/', icon: 'dashboard' },
    {
      label: 'Reservas',
      path: '/reservas',
      icon: 'event_note',
      roles: [Role.PROFESSOR, Role.SECRETARIO, Role.ADMIN],
    },
    {
      label: 'Agenda',
      path: '/agenda',
      icon: 'calendar_month',
      roles: [Role.PROFESSOR, Role.SECRETARIO, Role.ADMIN],
    },
    {
      label: 'Recursos',
      path: '/admin/recursos',
      icon: 'meeting_room',
      roles: [Role.ADMIN],
    },
    {
      label: 'Usuários',
      path: '/admin/usuarios',
      icon: 'group',
      roles: [Role.ADMIN],
    },
  ];

  /** Itens de navegação visíveis para o perfil atual. */
  readonly navItems = computed<NavItem[]>(() => {
    const current = this.user();
    return this.allNavItems.filter(
      (item) =>
        !item.roles ||
        (current && item.roles.some((r) => current.roles.includes(r))),
    );
  });

  readonly initials = computed(() => {
    const name = this.user()?.username ?? '';
    return name.slice(0, 2).toUpperCase();
  });

  logout(): void {
    this.auth.logout();
    this.notifier.info('Sessão encerrada.');
  }
}
