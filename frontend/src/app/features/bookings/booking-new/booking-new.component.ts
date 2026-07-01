import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BookingService } from '../../../core/services/booking.service';
import { ResourceService } from '../../../core/services/resource.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RecursoDTO } from '../../../core/models/recurso.model';
import { Reserva } from '../../../core/models/reserva.model';

/** Garante que o término seja posterior ao início. */
function intervaloValido(group: AbstractControl): ValidationErrors | null {
  const inicio = group.get('dataInicio')?.value;
  const fim = group.get('dataFim')?.value;
  if (!inicio || !fim) {
    return null;
  }
  return new Date(fim) > new Date(inicio) ? null : { intervaloInvalido: true };
}

@Component({
  selector: 'app-booking-new',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './booking-new.component.html',
  styleUrl: './booking-new.component.scss',
})
export class BookingNewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly bookingService = inject(BookingService);
  private readonly resourceService = inject(ResourceService);
  private readonly auth = inject(AuthService);
  private readonly notifier = inject(NotificationService);
  private readonly router = inject(Router);

  readonly recursos = signal<RecursoDTO[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly conflito = signal(false);

  private readonly reservas = signal<Reserva[]>([]);

  readonly form = this.fb.nonNullable.group(
    {
      recursoId: [null as number | null, [Validators.required]],
      dataInicio: ['', [Validators.required]],
      dataFim: ['', [Validators.required]],
    },
    { validators: intervaloValido },
  );

  /** Reservas já existentes para o recurso selecionado (contexto ao usuário). */
  readonly reservasDoRecurso = computed<Reserva[]>(() => {
    const recursoId = this.form.controls.recursoId.value;
    if (!recursoId) {
      return [];
    }
    return this.reservas()
      .filter((r) => r.recursoId === recursoId && r.status !== 'CANCELADA')
      .sort(
        (a, b) =>
          new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime(),
      );
  });

  constructor() {
    forkJoin({
      recursos: this.resourceService.listarTodos(),
      reservas: this.bookingService.listarTodas(),
    })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe(({ recursos, reservas }) => {
        this.recursos.set(recursos);
        this.reservas.set(reservas);
      });

    // Limpa o aviso de conflito quando o usuário altera os dados.
    this.form.valueChanges.subscribe(() => this.conflito.set(false));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { recursoId, dataInicio, dataFim } = this.form.getRawValue();
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (this.bookingService.haConflito(this.reservas(), recursoId!, inicio, fim)) {
      this.conflito.set(true);
      this.notifier.error('Conflito de horário com uma reserva existente.');
      return;
    }

    const usuarioId = this.auth.currentUser()?.id;
    if (!usuarioId) {
      this.notifier.error('Sessão inválida. Faça login novamente.');
      return;
    }

    this.salvando.set(true);
    this.bookingService
      .criar({
        usuarioId,
        recursoId: recursoId!,
        dataInicio,
        dataFim,
      })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.notifier.success('Reserva criada com sucesso!');
          this.router.navigate(['/reservas']);
        },
      });
  }
}
