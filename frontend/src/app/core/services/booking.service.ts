import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CriarReservaRequest, Reserva } from '../models/reserva.model';

/** Acesso ao booking-service via API Gateway (`/bookings`). */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/bookings`;

  /** `GET /bookings`. */
  listarTodas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.baseUrl);
  }

  /** `POST /bookings`. */
  criar(request: CriarReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.baseUrl, request);
  }

  /**
   * Verifica conflito de horário no cliente (o backend ainda não valida
   * sobreposição). Duas reservas conflitam se compartilham o mesmo recurso
   * e seus intervalos se sobrepõem.
   */
  haConflito(
    reservas: Reserva[],
    recursoId: number,
    inicio: Date,
    fim: Date,
  ): boolean {
    return reservas.some((r) => {
      if (r.recursoId !== recursoId || r.status === 'CANCELADA') {
        return false;
      }
      const rInicio = new Date(r.dataInicio).getTime();
      const rFim = new Date(r.dataFim).getTime();
      return inicio.getTime() < rFim && fim.getTime() > rInicio;
    });
  }
}
