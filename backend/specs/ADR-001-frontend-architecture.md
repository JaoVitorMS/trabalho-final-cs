# ADR-001 — Arquitetura Front-End OpenSARC (Angular)

**Status:** Proposto  
**Data:** Abril de 2026  
**Autores:** Artur Greco · João Vitor Moreira · João Victor Bonatto

---

## Contexto

O OpenSARC precisa de uma interface web responsiva que permita:
- Consulta pública do painel de status de recursos em tempo real (sem login)
- Autenticação por matrícula e senha, integrada ao Keycloak via API Gateway
- Fluxos distintos por perfil: Administrador, Secretário, Docente, Aluno
- Comunicação com microserviços exclusivamente via API Gateway

---

## Decisão

Adotar **Angular** como framework principal do front-end.

| Decisão | Escolha | Justificativa |
|---|---|---|
| Framework | Angular 17+ (standalone components) | Estrutura opinada, DI nativa, ideal para apps corporativos |
| Formulários | Reactive Forms | Validação complexa (conflito de horário, campos dependentes) |
| Estado HTTP | HttpClient + Observables (RxJS) | Reativo por padrão, integra nativamente com interceptors |
| Tempo real | SSE (EventSource nativo) | Atualização do painel de status sem polling |
| Roteamento | RouterModule com lazy loading | Carregamento sob demanda por módulo/perfil |
| Proteção de rotas | AuthGuard (CanActivate) | Controle de acesso por perfil no roteamento |
| Estilização | Angular Material + SCSS | Componentes acessíveis prontos; personalizáveis |
| Calendário | FullCalendar Angular wrapper | Suporte nativo a visões semanal/mensal |
| Testes | Jasmine + Karma (unit) · Cypress (e2e) | Stack padrão do Angular CLI |

---

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                        # Singleton: guards, interceptors, serviços globais
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts        # CanActivate por perfil
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts  # Injeta Bearer token
│   │   │   │   └── error.interceptor.ts # 401 → refresh · 403 → /login
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── booking.service.ts
│   │   │       ├── resource.service.ts
│   │   │       └── realtime.service.ts  # SSE (EventSource)
│   │   ├── shared/                      # Componentes e pipes reutilizáveis
│   │   │   ├── components/
│   │   │   │   ├── status-card/
│   │   │   │   ├── resource-calendar/
│   │   │   │   ├── booking-form/
│   │   │   │   └── notif-toast/
│   │   │   └── pipes/
│   │   │       └── status-color.pipe.ts
│   │   ├── features/                    # Feature modules (lazy loaded)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── recover-password/
│   │   │   ├── dashboard/               # Painel público de status
│   │   │   ├── bookings/
│   │   │   │   ├── booking-list/
│   │   │   │   ├── booking-new/
│   │   │   │   └── booking-approve/
│   │   │   ├── calendar/
│   │   │   ├── evaluations/
│   │   │   └── admin/
│   │   │       ├── resources/
│   │   │       └── users/
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   ├── environments/
│   │   ├── environment.ts               # dev: API Gateway local
│   │   └── environment.prod.ts          # prod: URL de produção
│   └── main.ts
├── Dockerfile
├── nginx.conf
└── angular.json
```

---

## Rotas e controle de acesso

| Rota | Módulo | Perfis permitidos |
|---|---|---|
| `/` | DashboardModule | Todos (sem login) |
| `/login` | AuthModule | Público |
| `/bookings` | BookingModule | Docente, Secretário |
| `/bookings/new` | BookingModule | Docente, Secretário |
| `/bookings/approve` | BookingModule | Secretário |
| `/calendar` | CalendarModule | Todos autenticados |
| `/events/new` | BookingModule | Docente, Secretário |
| `/evaluations` | EvaluationModule | Aluno, Docente |
| `/admin/resources` | AdminModule | Administrador |
| `/admin/users` | AdminModule | Administrador |

---

## Componentes principais

### StatusCardComponent
Exibe o status de um recurso com código de cores:
- Vermelho — ocupado agora e no próximo horário
- Amarelo — livre agora, reservado no próximo
- Verde — reservado agora, livre no próximo

Atualizado via `RealtimeService` (SSE) sem recarregar a página.

```typescript
@Input() resource: Resource;
@Input() status: 'busy-both' | 'free-next' | 'busy-next';
```

### ResourceCalendarComponent
Calendário semanal/mensal via FullCalendar. Exibe alocações aprovadas, pendentes e eventos avulsos com cores distintas via `EventInput[]`.

### BookingFormComponent
Formulário reativo com:
- `FormGroup` para recurso, disciplina, data e horário
- Validação assíncrona de conflito (chamada ao `BookingService` via `asyncValidator`)
- Exibe conflito inline antes de submeter

### AuthGuard
```typescript
canActivate(route: ActivatedRouteSnapshot): boolean {
  const perfis = route.data['roles'] as string[];
  return this.authService.hasAnyRole(perfis);
}
```

---

## Autenticação e segurança

- Login via `POST /api/auth/login` → JWT (access + refresh token)
- Access token armazenado em memória (`AuthService`) — **não em localStorage**
- Refresh token em cookie HttpOnly (gerenciado pelo back-end/Keycloak)
- `AuthInterceptor` injeta `Authorization: Bearer <token>` em toda requisição
- `ErrorInterceptor` trata 401 (tenta refresh) e 403 (redireciona para `/login`)
- Validação do JWT feita no **API Gateway** (Keycloak) — o front apenas carrega o token

---

## Comunicação com o back-end

```
[Angular SPA]
    |
    | HttpClient (REST) ─────────────────────────────┐
    |                                                 ▼
    | EventSource (SSE) ──────── [API Gateway] ─────► [Microserviços]
                                  Keycloak (JWT)
```

Toda comunicação passa pelo API Gateway em `/api/v1/...`. O Angular nunca chama microserviços diretamente.

---

## Docker

```dockerfile
# Dockerfile (multi-stage)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/opensarc /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf — SPA fallback + proxy para o gateway
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://api-gateway:8080/;
  }
}
```

```yaml
# Trecho do docker-compose.yml
frontend:
  build: ./frontend
  ports:
    - "4200:80"
  depends_on:
    - api-gateway
  environment:
    - API_BASE_URL=http://api-gateway:8080
```

---

## Decisões descartadas

| Alternativa | Motivo |
|---|---|
| React | Angular oferece estrutura mais rígida e adequada para equipes pequenas com muitos fluxos de formulário |
| Next.js | SSR desnecessário; painel público funciona bem como SPA |
| NgRx (Redux) | Overhead para o tamanho do projeto; HttpClient + Observables + serviços cobre os casos de uso |
| localStorage para JWT | Vulnerável a XSS; usamos memória + cookie HttpOnly |

---

## Consequências

✅ Estrutura modular com lazy loading — cada perfil carrega só o que precisa  
✅ Formulários reativos com validação assíncrona de conflito  
✅ Atualização em tempo real do painel via SSE  
✅ Controle de acesso por perfil no roteamento (AuthGuard)  
✅ Containerizado via Docker, integrado ao docker-compose do projeto  
⚠️ SSE requer configuração de timeout/reconnect no `RealtimeService`  
⚠️ Refresh token exige cookie HttpOnly configurado corretamente no back-end (Keycloak)
