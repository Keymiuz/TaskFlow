# CLAUDE.md — TaskFlow

Este arquivo orienta o agente durante toda a implementação do projeto.
Leia este arquivo inteiro antes de escrever qualquer código.

---

## Visão geral

TaskFlow é um sistema Kanban fullstack com tempo real.
O SPEC.md na raiz contém a especificação completa — é a fonte da verdade.
Implemente exatamente o que está no SPEC, sem adicionar libs extras ou funcionalidades não especificadas.

---

## Estrutura de repositório

```
taskflow/
├── CLAUDE.md          ← este arquivo
├── SPEC.md            ← especificação completa
├── docker-compose.yml
├── taskflow-api/      ← Spring Boot (Java 21)
└── taskflow-web/      ← Angular 18
```

---

## Como rodar o projeto

### Subir tudo com Docker (recomendado)

```bash
# Na raiz do repositório
cp .env.example .env        # preencher JWT_SECRET
docker-compose up --build
```

Acesso:
- Frontend: http://localhost:4200
- API: http://localhost:8080
- DB: localhost:5432

### Rodar backend local (sem Docker)

```bash
cd taskflow-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Rodar frontend local

```bash
cd taskflow-web
npm install
ng serve
```

### Rodar testes do backend

```bash
cd taskflow-api
./mvnw test
```

---

## Convenções de código

### Backend (Java)

- Java 21 com records para DTOs, Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`) nas entidades e services.
- Pacotes organizados por **domínio** (feature), não por camada. Exemplo: `com.taskflow.task.*`, não `com.taskflow.controller.*`.
- Nunca retornar entidades JPA diretamente nos controllers — sempre usar DTOs/records.
- Usar `UUID` como tipo de ID em todas as entidades (`@GeneratedValue(strategy = GenerationType.UUID)`).
- Exceções customizadas em `com.taskflow.exception` com `GlobalExceptionHandler` (`@RestControllerAdvice`).
- Toda resposta de erro segue o padrão `ApiError { status, error, message, timestamp, path }`.
- Validação com Bean Validation (`@NotBlank`, `@NotNull`, `@Valid`) nos request bodies.
- Usar `@PreAuthorize` para autorização nos métodos de controller — não validar roles dentro dos services.
- Timestamps em UTC. Usar `LocalDateTime` / `LocalDate` com Spring Data Auditing para `createdAt`/`updatedAt`.
- Não usar `@Transactional` em controllers, apenas em services.
- Prefixo de todos os endpoints REST: `/api/v1`.

### Frontend (Angular)

- Angular 18 **standalone components** — sem NgModules.
- Usar `inject()` ao invés de injeção via construtor.
- Usar `signal()` e `computed()` para estado local dos componentes.
- Usar `takeUntilDestroyed()` para gerenciar subscriptions.
- Lazy loading em todas as rotas com `loadComponent`.
- Angular Material para todos os componentes de UI — não criar componentes visuais do zero.
- Seguir o padrão de models em `src/app/core/models/*.model.ts`.
- Nunca usar `any` no TypeScript — tipar tudo.
- Usar `HttpClient` com `Observable` — não converter para `Promise`.

---

## Banco de dados

- O `spring.jpa.hibernate.ddl-auto` está como `update` no perfil dev — o schema é criado automaticamente pelo Hibernate a partir das entidades.
- **Não criar arquivos SQL de schema manualmente** — o Hibernate cuida disso.
- Em produção, usar `validate` e gerenciar migrações com Flyway (fora do escopo desta implementação).
- Seed de dados: ao iniciar em perfil `dev`, o `DataInitializer.java` deve criar um usuário admin padrão se não existir:
  - email: `admin@taskflow.com`
  - senha: `admin123`
  - role: `ADMIN`

---

## Autenticação

- Access token: JWT com expiração de 15 minutos. Claims: `sub` (email), `role`, `userId`.
- Refresh token: salvo no banco (`refresh_tokens`), expiração de 7 dias, revogado após uso (rotação).
- O frontend armazena tokens no `localStorage` com as chaves `tf_access_token` e `tf_refresh_token`.
- O `JwtInterceptor` intercepta respostas 401, tenta refresh automático uma vez, e faz logout se o refresh também falhar.

---

## WebSocket

- Endpoint SockJS: `/ws` (com fallback HTTP long-polling automático via SockJS).
- Broker simples em memória (`enableSimpleBroker`).
- Após mover, criar, editar ou deletar uma task, o service publica no tópico `/topic/board/{boardId}`.
- O board component assina o tópico ao inicializar e cancela a assinatura ao destruir.
- **Não publicar eventos WebSocket dentro de controllers** — apenas nos services, após persistência bem-sucedida.

---

## Upload de arquivos

- Arquivos salvos localmente em `./uploads/{taskId}/` no perfil dev.
- Tamanho máximo: 10MB por arquivo.
- Tipos permitidos: `pdf, png, jpg, jpeg, gif, txt, md, docx, xlsx`.
- Rejeitar outros tipos com `400 Bad Request` e mensagem clara.
- O endpoint retorna a URL de download: `GET /api/v1/attachments/{id}/download`.

---

## Segurança — regras obrigatórias

- Nunca logar senhas ou tokens em nenhum nível de log.
- O `JWT_SECRET` nunca pode ter valor default hardcoded no código — apenas via variável de ambiente.
- CORS configurado para aceitar apenas `http://localhost:4200` no perfil dev.
- O endpoint `/ws/**` e `/auth/**` são públicos. Todos os outros exigem autenticação.
- Senhas armazenadas com `BCryptPasswordEncoder` (strength 12).

---

## Ordem de implementação recomendada

Siga esta ordem para minimizar retrabalho:

1. `docker-compose.yml` + `.env.example`
2. Entidades JPA + Repositories (sem lógica ainda)
3. `SecurityConfig` + `JwtService` + `JwtAuthFilter`
4. `AuthController` (register, login, refresh, logout)
5. `DataInitializer` (seed do admin)
6. CRUD de `Project` + `ProjectMember`
7. CRUD de `Board` + `Column`
8. CRUD de `Task` + endpoint de move
9. `WebSocketConfig` + `BoardEventPublisher`
10. `Comment` + `Attachment` + upload
11. `AuditAspect` + `AuditController`
12. Testes unitários (Auth, Task, Board controller)
13. Angular: setup + auth + guards + interceptor
14. Angular: tela de projetos
15. Angular: board Kanban + WebSocket
16. Angular: task detail + comentários + upload
17. Angular: dashboard com Chart.js
18. Dockerfiles + nginx.conf
19. README.md com gif e instruções de uso

---

## O que NÃO fazer

- Não usar Spring MVC com Thymeleaf — é uma API REST pura.
- Não usar H2 em memória — usar PostgreSQL desde o início via Docker.
- Não retornar senha ou refresh token em nenhum response de usuário.
- Não criar endpoints sem proteger com `@PreAuthorize` ou regras de SecurityConfig.
- Não usar `var` sem tipo inferível claro no Java.
- Não instalar bibliotecas Angular que não estejam no SPEC (especialmente bibliotecas de Kanban prontas — o drag & drop deve usar CDK).
- Não commitar o arquivo `.env` — apenas `.env.example`.
