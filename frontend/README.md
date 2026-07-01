# OpenSARC — Front-end (Angular)

Interface web do **OpenSARC** (Sistema de Alocação de Recursos Acadêmicos),
inspirada no [SARC da PUCRS](https://sarc.pucrs.br/Default/) e construída sobre
os endpoints do backend de microserviços deste repositório.

A arquitetura segue o **ADR-001 — Arquitetura Front-End OpenSARC**
(`specs/ADR-001-frontend-architecture.md`): Angular standalone, camadas
`core / shared / features`, lazy loading por rota, Reactive Forms, interceptors
de autenticação/erro, AuthGuard por perfil e Angular Material.

---

## Stack

| Item | Escolha |
|------|---------|
| Framework | Angular 19 (standalone components, signals) |
| UI | Angular Material 19 (Material 3) + SCSS |
| HTTP | `HttpClient` + RxJS + interceptors funcionais |
| Formulários | Reactive Forms (com validação de conflito de horário) |
| Roteamento | Router com `loadComponent` (lazy) + `authGuard` por perfil |
| Build/Dev | Angular CLI · proxy de dev · Docker (nginx) |

---

## Pré-requisitos

- Node.js 20+ (testado em Node 24) e npm 10+
- Backend em execução (ver seção *Backend* abaixo)

---

## Como executar (desenvolvimento)

```bash
cd frontend
npm install
npm start          # ng serve --proxy-config proxy.conf.json
```

App em `http://localhost:4200`. O `proxy.conf.json` encaminha as chamadas para
os microserviços, evitando CORS no desenvolvimento.

### Login de demonstração

O backend ainda **não expõe endpoint de autenticação** (somente cadastro e
consulta). Enquanto o login com JWT/Keycloak descrito no ADR não existe, o
front usa um login simulado. Use um destes usuários (qualquer senha):

| Usuário | Perfil | Acesso |
|---------|--------|--------|
| `prof.maria`, `prof.joao`, `prof.luisa` | PROFESSOR | Reservas, Agenda |
| `secretaria` | SECRETARIO | Reservas, Agenda |
| `admin` | ADMIN | Tudo, incluindo área administrativa |

> A tela de login traz atalhos para cada perfil. O painel inicial (`/`) é
> público e não exige login.

---

## Backend — subir os serviços

O front consome 3 microserviços (via API Gateway na porta 8080):

```bash
# Na raiz do repositório — infraestrutura (Postgres, Mongo, RabbitMQ)
docker compose up -d

# Em terminais separados (ordem recomendada):
cd discovery-server && ./mvnw spring-boot:run   # :8761
cd config-server    && ./mvnw spring-boot:run   # :8888
cd auth-service     && ./mvnw spring-boot:run   # :8081
cd resource-service && ./mvnw spring-boot:run   # :8082
cd booking-service  && ./mvnw spring-boot:run   # :8083
cd api-gateway      && ./mvnw spring-boot:run   # :8080
```

---

## Mapeamento Front → Endpoints

Todas as chamadas são centralizadas em `core/services/*` e usam caminhos
relativos resolvidos por `environment.apiBaseUrl`.

| Tela / Ação | Serviço (front) | Método + Endpoint |
|-------------|-----------------|-------------------|
| Painel de status (`/`) | `ResourceService` + `BookingService` | `GET /resources` · `GET /bookings` |
| Cadastro (`/cadastro`, admin) | `AuthService.cadastrar` | `POST /auth/usuarios/cadastrar` |
| Consulta de usuário (admin) | `AuthService.buscarPorId` | `GET /auth/usuarios/{id}` |
| Lista de reservas (`/reservas`) | `BookingService.listarTodas` | `GET /bookings` |
| Nova reserva (`/reservas/nova`) | `BookingService.criar` | `POST /bookings` |
| Agenda semanal (`/agenda`) | `BookingService` + `ResourceService` | `GET /bookings` · `GET /resources` |
| Recursos — listar (admin) | `ResourceService.listarTodos` | `GET /resources` |
| Recursos — auditório (admin) | `ResourceService.cadastrarAuditorio` | `POST /resources/auditorios` |
| Recursos — notebook (admin) | `ResourceService.cadastrarNotebook` | `POST /resources/notebooks` |

### Status dos recursos (painel público)

O status exibido nos cards é **calculado no cliente** a partir das reservas
confirmadas (o backend não possui endpoint de status em tempo real):

- 🟢 **Livre** — sem reserva agora nem nas próximas 3h
- 🟡 **Reservado em breve** — livre agora, com reserva nas próximas 3h
- 🔴 **Ocupado agora** — há reserva cobrindo o horário atual

---

## Estrutura de pastas

```
src/app/
├── core/                      # Singletons: o que é instanciado uma vez
│   ├── guards/auth.guard.ts          # CanActivate por perfil (data.roles)
│   ├── interceptors/                 # auth (Bearer) + error (401/403)
│   ├── models/                       # Interfaces dos DTOs do backend
│   └── services/                     # auth / resource / booking / notification
├── shared/                    # Reutilizáveis (sem estado de negócio)
│   ├── components/status-card/       # Card de status do recurso
│   ├── components/empty-state/
│   └── pipes/status-color.pipe.ts
├── features/                  # Telas com lazy loading
│   ├── dashboard/                    # Painel público
│   ├── auth/login · auth/register
│   ├── bookings/booking-list · booking-new
│   ├── calendar/                     # Agenda semanal
│   └── admin/resources · admin/users
├── app.component.*            # Shell (toolbar + navegação por perfil)
├── app.config.ts             # Providers (router, http, interceptors, animations)
└── app.routes.ts             # Rotas + guards
```

---

## Build de produção / Docker

```bash
npm run build                          # gera dist/opensarc-frontend/
docker build -t opensarc-frontend .
docker run -p 4200:80 opensarc-frontend
```

O `nginx.conf` faz o *SPA fallback* e o proxy de `/auth`, `/resources` e
`/bookings` para o API Gateway. Para integrar ao `docker-compose.yml` da raiz,
adicione um serviço `frontend` (ver bloco de exemplo no ADR-001).

---

## ⚠️ Observações de integração

1. **Login real ausente.** O ADR prevê `POST /auth/login` com JWT/Keycloak, mas
   o `auth-service` atual só tem cadastro/consulta. O `AuthService` foi
   desenhado para trocar o login simulado por uma chamada real sem alterar
   guards/interceptors.

2. **Filtro do API Gateway.** As rotas do gateway usam `StripPrefix=1`, que
   remove o primeiro segmento do caminho antes de encaminhar. Como os
   controllers já carregam o prefixo do serviço (`/resources`, `/bookings`,
   `/auth/...`), no desenvolvimento o `proxy.conf.json` aponta **direto para
   cada microserviço** (8081/8082/8083), garantindo que os caminhos batam. Para
   rotear via gateway, ajuste o `StripPrefix`/base path no backend e atualize os
   `target` do proxy para `http://localhost:8080`.

3. **Categoria de recurso.** O cadastro de recursos não envia `categoria` (a FK
   é opcional); por isso `categoriaNome` pode vir vazio na listagem.

4. **Tempo real (SSE).** O `RealtimeService` do ADR depende de um endpoint SSE
   inexistente no backend; o painel usa recarga manual (botão *Atualizar*).
