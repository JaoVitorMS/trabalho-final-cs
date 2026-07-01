import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BookingService } from '../../core/services/booking.service';
import { ResourceService } from '../../core/services/resource.service';
import { Reserva } from '../../core/models/reserva.model';

interface EventoAgenda {
  id: string;
  recursoNome: string;
  inicio: Date;
  fim: Date;
  status: string;
}

interface DiaAgenda {
  data: Date;
  hoje: boolean;
  eventos: EventoAgenda[];
}

const UM_DIA = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  private readonly bookingService = inject(BookingService);
  private readonly resourceService = inject(ResourceService);

  readonly loading = signal(false);
  readonly inicioSemana = signal(this.segundaFeiraDe(new Date()));

  private readonly eventos = signal<EventoAgenda[]>([]);

  readonly semana = computed<DiaAgenda[]>(() => {
    const inicio = this.inicioSemana();
    const hoje = this.zerarHoras(new Date()).getTime();

    return Array.from({ length: 7 }, (_, i) => {
      const data = new Date(inicio.getTime() + i * UM_DIA);
      const diaTs = this.zerarHoras(data).getTime();
      const eventos = this.eventos()
        .filter((e) => this.zerarHoras(e.inicio).getTime() === diaTs)
        .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
      return { data, hoje: diaTs === hoje, eventos };
    });
  });

  readonly rotuloSemana = computed(() => {
    const inicio = this.inicioSemana();
    const fim = new Date(inicio.getTime() + 6 * UM_DIA);
    return { inicio, fim };
  });

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.loading.set(true);
    forkJoin({
      reservas: this.bookingService.listarTodas(),
      recursos: this.resourceService.listarTodos(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ reservas, recursos }) => {
        const nomePorId = new Map(recursos.map((r) => [r.id, r.nome]));
        this.eventos.set(
          reservas.map((r: Reserva) => ({
            id: r.id,
            recursoNome: nomePorId.get(r.recursoId) ?? `Recurso #${r.recursoId}`,
            inicio: new Date(r.dataInicio),
            fim: new Date(r.dataFim),
            status: r.status,
          })),
        );
      });
  }

  semanaAnterior(): void {
    this.inicioSemana.set(
      new Date(this.inicioSemana().getTime() - 7 * UM_DIA),
    );
  }

  proximaSemana(): void {
    this.inicioSemana.set(new Date(this.inicioSemana().getTime() + 7 * UM_DIA));
  }

  hoje(): void {
    this.inicioSemana.set(this.segundaFeiraDe(new Date()));
  }

  classeStatus(status: string): string {
    return `evt-${status.toLowerCase()}`;
  }

  private segundaFeiraDe(data: Date): Date {
    const d = this.zerarHoras(data);
    const diaSemana = (d.getDay() + 6) % 7; // 0 = segunda
    return new Date(d.getTime() - diaSemana * UM_DIA);
  }

  private zerarHoras(data: Date): Date {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
