import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ResourceService } from '../../core/services/resource.service';
import { BookingService } from '../../core/services/booking.service';
import { RecursoDTO } from '../../core/models/recurso.model';
import { Reserva, StatusRecurso } from '../../core/models/reserva.model';
import { StatusCardComponent } from '../../shared/components/status-card/status-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

interface RecursoStatusVM {
  recurso: RecursoDTO;
  status: StatusRecurso;
  proximaReserva: string | null;
}

/** Janela (ms) usada para classificar uma reserva como "em breve". */
const JANELA_EM_BREVE_MS = 3 * 60 * 60 * 1000;

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    StatusCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly resourceService = inject(ResourceService);
  private readonly bookingService = inject(BookingService);

  protected readonly StatusRecurso = StatusRecurso;

  readonly loading = signal(false);
  readonly atualizadoEm = signal<Date | null>(null);
  readonly termo = signal('');
  readonly filtroStatus = signal<StatusRecurso | 'TODOS'>('TODOS');

  private readonly recursos = signal<RecursoDTO[]>([]);
  private readonly reservas = signal<Reserva[]>([]);

  /** View model: recurso + status calculado a partir das reservas. */
  private readonly statusList = computed<RecursoStatusVM[]>(() => {
    const agora = Date.now();
    return this.recursos().map((recurso) =>
      this.calcularStatus(recurso, this.reservas(), agora),
    );
  });

  readonly filtrados = computed<RecursoStatusVM[]>(() => {
    const termo = this.termo().trim().toLowerCase();
    const status = this.filtroStatus();
    return this.statusList().filter((vm) => {
      const casaTermo =
        !termo ||
        vm.recurso.nome.toLowerCase().includes(termo) ||
        (vm.recurso.categoriaNome ?? '').toLowerCase().includes(termo);
      const casaStatus = status === 'TODOS' || vm.status === status;
      return casaTermo && casaStatus;
    });
  });

  readonly contagem = computed(() => {
    const list = this.statusList();
    return {
      total: list.length,
      livres: list.filter((v) => v.status === StatusRecurso.LIVRE).length,
      parciais: list.filter((v) => v.status === StatusRecurso.PARCIAL).length,
      ocupados: list.filter((v) => v.status === StatusRecurso.OCUPADO).length,
    };
  });

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    forkJoin({
      recursos: this.resourceService.listarTodos(),
      reservas: this.bookingService.listarTodas(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ recursos, reservas }) => {
          this.recursos.set(recursos);
          this.reservas.set(reservas);
          this.atualizadoEm.set(new Date());
        },
        // Erros já são tratados/exibidos pelo errorInterceptor.
        error: () => this.atualizadoEm.set(new Date()),
      });
  }

  private calcularStatus(
    recurso: RecursoDTO,
    reservas: Reserva[],
    agora: number,
  ): RecursoStatusVM {
    const doRecurso = reservas
      .filter((r) => r.recursoId === recurso.id && r.status !== 'CANCELADA')
      .map((r) => ({
        inicio: new Date(r.dataInicio).getTime(),
        fim: new Date(r.dataFim).getTime(),
      }))
      .sort((a, b) => a.inicio - b.inicio);

    const ocupadoAgora = doRecurso.some(
      (r) => r.inicio <= agora && agora < r.fim,
    );
    const proxima = doRecurso.find((r) => r.inicio > agora) ?? null;
    const reservadoEmBreve =
      !!proxima && proxima.inicio - agora <= JANELA_EM_BREVE_MS;

    let status: StatusRecurso;
    if (ocupadoAgora) {
      status = StatusRecurso.OCUPADO;
    } else if (reservadoEmBreve) {
      status = StatusRecurso.PARCIAL;
    } else {
      status = StatusRecurso.LIVRE;
    }

    return {
      recurso,
      status,
      proximaReserva: proxima
        ? new Date(proxima.inicio).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null,
    };
  }
}
