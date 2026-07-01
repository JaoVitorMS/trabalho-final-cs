# Architecture Decision Record (ADR)

## ADR 001: Implementação de Banco de Dados por Microserviço

**Status:** Aceito
**Data:** 12-05-2026
**Contexto:** OpenSARC - Projeto de Alocação de Recursos Acadêmicos

### Contexto
Originalmente, o projeto OpenSARC foi concebido com um modelo de dados unificado (monolítico). Para seguir os princípios de microserviços e garantir o isolamento completo, decidimos separar as responsabilidades de persistência.

### Decisão
Cada microserviço será proprietário de seu próprio esquema de banco de dados.
1. **Auth-Service:** Responsável pela tabela `USUARIO`.
2. **Resource-Service:** Responsável pelas tabelas `RECURSO`, `CATEGORIA`, `AUDITORIO` e `NOTEBOOK`.
3. **Booking-Service:** Responsável pela tabela `RESERVA`.

### Consequências
* **Integridade Referencial:** Chaves estrangeiras (FK) físicas entre bancos diferentes não são mais possíveis. A integridade será garantida na camada de aplicação (Service Layer).
* **Comunicação Inter-serviços:** O `Booking-Service` utilizará **Spring Cloud OpenFeign** para consultar dados de usuários e recursos.
* **Complexidade:** Aumenta a complexidade de configuração do `docker-compose.yml`, que agora orquestrará múltiplas instâncias de banco (ou múltiplos esquemas).
* **Performance:** Consultas que exigiam JOINs agora exigirão chamadas de rede (API)

---