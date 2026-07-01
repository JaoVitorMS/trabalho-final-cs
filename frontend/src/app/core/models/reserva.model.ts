/** Situação de uma reserva (definida pelo booking-service). */
export type ReservaStatus = 'CONFIRMADA' | 'PENDENTE' | 'CANCELADA' | string;

/** Documento de reserva retornado por `GET /bookings`. */
export interface Reserva {
  id: string;
  usuarioId: number;
  recursoId: number;
  /** ISO LocalDateTime, ex.: "2026-06-23T09:00:00". */
  dataInicio: string;
  /** ISO LocalDateTime. */
  dataFim: string;
  status: ReservaStatus;
}

/** Corpo de `POST /bookings`. O status é definido pelo backend. */
export interface CriarReservaRequest {
  usuarioId: number;
  recursoId: number;
  dataInicio: string;
  dataFim: string;
}

/**
 * Status calculado de um recurso para o painel público (dashboard).
 * Derivado das reservas confirmadas que cobrem o horário atual e o próximo.
 */
export enum StatusRecurso {
  /** Livre agora e no próximo horário. */
  LIVRE = 'LIVRE',
  /** Livre agora, porém reservado no próximo horário. */
  PARCIAL = 'PARCIAL',
  /** Ocupado agora. */
  OCUPADO = 'OCUPADO',
}
