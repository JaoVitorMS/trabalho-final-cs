/**
 * Configuração de desenvolvimento (`ng serve`).
 *
 * `apiBaseUrl` vazio + `proxy.conf.json` encaminham `/auth`, `/resources` e
 * `/bookings` para os microserviços locais (8081/8082/8083), evitando CORS.
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
};
