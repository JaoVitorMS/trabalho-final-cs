import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CadastrarAuditorioRequest,
  CadastrarNotebookRequest,
  RecursoDTO,
} from '../models/recurso.model';

/** Acesso ao resource-service via API Gateway (`/resources`). */
@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/resources`;

  /** `GET /resources`. */
  listarTodos(): Observable<RecursoDTO[]> {
    return this.http.get<RecursoDTO[]>(this.baseUrl);
  }

  /** `GET /resources/{id}`. */
  buscarPorId(id: number): Observable<RecursoDTO> {
    return this.http.get<RecursoDTO>(`${this.baseUrl}/${id}`);
  }

  /** `POST /resources/auditorios`. */
  cadastrarAuditorio(
    request: CadastrarAuditorioRequest,
  ): Observable<RecursoDTO> {
    return this.http.post<RecursoDTO>(`${this.baseUrl}/auditorios`, request);
  }

  /** `POST /resources/notebooks`. */
  cadastrarNotebook(
    request: CadastrarNotebookRequest,
  ): Observable<RecursoDTO> {
    return this.http.post<RecursoDTO>(`${this.baseUrl}/notebooks`, request);
  }
}
