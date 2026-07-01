/**
 * Configuração de produção.
 *
 * `apiBaseUrl` vazio faz o front chamar caminhos relativos (`/auth`, `/resources`,
 * `/bookings`). Em produção o nginx (ver nginx.conf) encaminha esses prefixos
 * para o API Gateway. Toda a comunicação passa pelo gateway — o Angular nunca
 * chama os microserviços diretamente.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
};
