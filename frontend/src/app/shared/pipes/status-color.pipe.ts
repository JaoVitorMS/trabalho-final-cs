import { Pipe, PipeTransform } from '@angular/core';
import { StatusRecurso } from '../../core/models/reserva.model';

type StatusAspect = 'color' | 'label' | 'icon';

const STATUS_META: Record<
  StatusRecurso,
  { color: string; label: string; icon: string }
> = {
  [StatusRecurso.LIVRE]: {
    color: 'var(--status-livre)',
    label: 'Livre',
    icon: 'check_circle',
  },
  [StatusRecurso.PARCIAL]: {
    color: 'var(--status-parcial)',
    label: 'Reservado em breve',
    icon: 'schedule',
  },
  [StatusRecurso.OCUPADO]: {
    color: 'var(--status-ocupado)',
    label: 'Ocupado agora',
    icon: 'block',
  },
};

/**
 * Converte um {@link StatusRecurso} em cor, rótulo ou ícone.
 * Uso: `status | statusColor` (cor) ou `status | statusColor:'label'`.
 */
@Pipe({ name: 'statusColor' })
export class StatusColorPipe implements PipeTransform {
  transform(status: StatusRecurso, aspect: StatusAspect = 'color'): string {
    return STATUS_META[status]?.[aspect] ?? '';
  }
}
