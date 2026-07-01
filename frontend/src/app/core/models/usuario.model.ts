/**
 * Perfis de acesso.
 *
 * O backend (auth-service) atribui apenas `PROFESSOR` no cadastro. Os demais
 * perfis existem para o controle de rotas descrito no ADR-001 e são atribuídos
 * pelo login de demonstração (ver AuthService) enquanto o endpoint de login
 * com JWT/Keycloak não está disponível.
 */
export enum Role {
  PROFESSOR = 'PROFESSOR',
  SECRETARIO = 'SECRETARIO',
  ADMIN = 'ADMIN',
}

/** Resposta de `GET /auth/usuarios/{id}` e `POST /auth/usuarios/cadastrar`. */
export interface UsuarioDTO {
  id: number;
  username: string;
}

/** Corpo de `POST /auth/usuarios/cadastrar`. */
export interface CadastrarUsuarioRequest {
  username: string;
  password: string;
}

/** Usuário autenticado na sessão do front-end. */
export interface AuthUser {
  id: number;
  username: string;
  roles: Role[];
}
