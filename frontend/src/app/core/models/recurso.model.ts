/** Tipos concretos de recurso suportados pelo resource-service. */
export type TipoRecurso = 'Auditorio' | 'Notebook';

/** Resposta de `GET /resources` e `GET /resources/{id}`. */
export interface RecursoDTO {
  id: number;
  nome: string;
  descricao: string | null;
  tipoRecurso: TipoRecurso | string;
  categoriaNome: string | null;
}

/** Corpo de `POST /resources/auditorios`. */
export interface CadastrarAuditorioRequest {
  nome: string;
  descricao?: string;
  capacidade: number;
}

/** Corpo de `POST /resources/notebooks`. */
export interface CadastrarNotebookRequest {
  nome: string;
  descricao?: string;
  marca?: string;
  modelo?: string;
}
