import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BookingService } from '../../../core/services/booking.service';
import { ResourceService } from '../../../core/services/resource.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reserva } from '../../../core/models/reserva.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

interface ReservaVM {
  reserva: Reserva;
  recursoNome: string;
  usuarioNome: string;
  doUsuarioAtual: boolean;
}

@Component({
  selector: 'app-booking-list',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    EmptyStateComponent,
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class BookingListComponent {
  private readonly bookingService = inject(BookingService);
  private readonly resourceService = inject(ResourceService);
  private readonly auth = inject(AuthService);

  readonly colunas = ['recurso', 'usuario', 'inicio', 'fim', 'status'];
  readonly loading = signal(false);
  readonly somenteMinhas = signal(false);

  private readonly reservas = signal<ReservaVM[]>([]);

  readonly visiveis = computed<ReservaVM[]>(() => {
    const todas = this.reservas();
    return this.somenteMinhas()
      ? todas.filter((vm) => vm.doUsuarioAtual)
      : todas;
  });

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    const usuarioAtualId = this.auth.currentUser()?.id ?? -1;

    forkJoin({
      reservas: this.bookingService.listarTodas(),
      recursos: this.resourceService.listarTodos(),
    }).subscribe({
      next: ({ reservas, recursos }) => {
        const recursoNomePorId = new Map(
          recursos.map((r) => [r.id, r.nome]),
        );

        const idsUsuarios = [...new Set(reservas.map((r) => r.usuarioId))];
        const nomesUsuarios$ = idsUsuarios.length
          ? forkJoin(
              idsUsuarios.map((id) =>
                this.auth.resolverUsername(id).pipe(
                  map((nome) => [id, nome] as const),
                  catchError(() => of([id, `Usuário #${id}`] as const)),
                ),
              ),
            )
          : of([] as (readonly [number, string])[]);

        nomesUsuarios$
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe((pares) => {
            const usuarioNomePorId = new Map(pares);
            this.reservas.set(
              reservas.map((reserva) => ({
                reserva,
                recursoNome:
                  recursoNomePorId.get(reserva.recursoId) ??
                  `Recurso #${reserva.recursoId}`,
                usuarioNome:
                  usuarioNomePorId.get(reserva.usuarioId) ??
                  `Usuário #${reserva.usuarioId}`,
                doUsuarioAtual: reserva.usuarioId === usuarioAtualId,
              })),
            );
          });
      },
      error: () => this.loading.set(false),
    });
  }

  classeStatus(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}
