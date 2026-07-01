import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { RecursoDTO } from '../../../core/models/recurso.model';
import { StatusRecurso } from '../../../core/models/reserva.model';
import { StatusColorPipe } from '../../pipes/status-color.pipe';

/**
 * Cartão de status de um recurso para o painel público (ADR-001).
 * A cor da borda/indicador reflete o status atual via {@link StatusColorPipe}.
 */
@Component({
  selector: 'app-status-card',
  imports: [MatCardModule, MatIconModule, StatusColorPipe],
  templateUrl: './status-card.component.html',
  styleUrl: './status-card.component.scss',
})
export class StatusCardComponent {
  @Input({ required: true }) recurso!: RecursoDTO;
  @Input({ required: true }) status!: StatusRecurso;
  @Input() proximaReserva: string | null = null;

  protected readonly tipoIcone: Record<string, string> = {
    Auditorio: 'meeting_room',
    Notebook: 'laptop_mac',
  };

  iconeRecurso(): string {
    return this.tipoIcone[this.recurso.tipoRecurso] ?? 'category';
  }
}
