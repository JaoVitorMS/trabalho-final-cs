import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthUser,
  CadastrarUsuarioRequest,
  Role,
  UsuarioDTO,
} from '../models/usuario.model';

/**
 * Diretório de login de DEMONSTRAÇÃO.
 *
 * O backend atual (auth-service) NÃO expõe endpoint de autenticação — só
 * cadastro e consulta por id. Enquanto o login com JWT/Keycloak descrito no
 * ADR-001 não existe, mapeamos usuários conhecidos (seed `V2__seed_professores`
 * + perfis fictícios) para permitir exercitar o controle de acesso por perfil.
 *
 * Substituir por `POST /auth/login` quando o backend disponibilizar o token.
 */
const DEMO_DIRECTORY: Record<string, AuthUser> = {
  'prof.maria': { id: 1, username: 'prof.maria', roles: [Role.PROFESSOR] },
  'prof.joao': { id: 2, username: 'prof.joao', roles: [Role.PROFESSOR] },
  'prof.luisa': { id: 3, username: 'prof.luisa', roles: [Role.PROFESSOR] },
  secretaria: { id: 100, username: 'secretaria', roles: [Role.SECRETARIO] },
  admin: { id: 999, username: 'admin', roles: [Role.ADMIN] },
};

const SESSION_KEY = 'opensarc.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth/usuarios`;

  /** Access token mantido apenas em memória (proteção XSS — ADR-001). */
  private accessToken: string | null = null;

  private readonly currentUserSig = signal<AuthUser | null>(
    this.restoreSession(),
  );

  /** Usuário autenticado (signal, read-only). */
  readonly currentUser = this.currentUserSig.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSig() !== null);

  /**
   * Login simulado. Aceita um usuário do diretório de demonstração.
   * Troque por uma chamada real a `POST /auth/login` quando disponível.
   */
  login(username: string, _password: string): Observable<AuthUser> {
    const user = DEMO_DIRECTORY[username.trim().toLowerCase()];
    if (!user) {
      return throwError(
        () =>
          new Error(
            'Usuário não encontrado. Use prof.maria, prof.joao, prof.luisa, secretaria ou admin.',
          ),
      );
    }
    this.accessToken = `demo.${user.username}.${Date.now()}`;
    this.persistSession(user);
    this.currentUserSig.set(user);
    return of(user);
  }

  logout(): void {
    this.accessToken = null;
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUserSig.set(null);
  }

  getToken(): string | null {
    return this.accessToken;
  }

  hasAnyRole(roles: Role[]): boolean {
    if (!roles?.length) {
      return this.isAuthenticated();
    }
    const user = this.currentUserSig();
    return !!user && user.roles.some((r) => roles.includes(r));
  }

  // --- Endpoints reais do auth-service -------------------------------------

  /** `POST /auth/usuarios/cadastrar` — cria um professor. */
  cadastrar(request: CadastrarUsuarioRequest): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.baseUrl}/cadastrar`, request);
  }

  /** `GET /auth/usuarios/{id}`. */
  buscarPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.baseUrl}/${id}`);
  }

  /** Resolve o nome de usuário a partir do id (para exibição em listas). */
  resolverUsername(id: number): Observable<string> {
    return this.buscarPorId(id).pipe(map((u) => u.username));
  }

  // --- Sessão --------------------------------------------------------------

  private persistSession(user: AuthUser): void {
    // Persistimos apenas o perfil (não o token) para sobreviver ao refresh.
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  private restoreSession(): AuthUser | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
