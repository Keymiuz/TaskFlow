# SPEC.md — TaskFlow

> Sistema de gerenciamento de projetos estilo Kanban com atualizações em tempo real.
> Stack: **Java 21 + Spring Boot 3** (backend) · **Angular 18** (frontend) · **PostgreSQL** · **WebSocket (STOMP)**

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Stack & Dependências](#3-stack--dependências)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Modelo de Dados](#5-modelo-de-dados)
6. [Autenticação & Autorização](#6-autenticação--autorização)
7. [API REST](#7-api-rest)
8. [WebSocket (STOMP)](#8-websocket-stomp)
9. [Frontend — Módulos Angular](#9-frontend--módulos-angular)
10. [Upload de Arquivos](#10-upload-de-arquivos)
11. [Auditoria](#11-auditoria)
12. [Docker & Infraestrutura](#12-docker--infraestrutura)
13. [Variáveis de Ambiente](#13-variáveis-de-ambiente)
14. [Roadmap de Implementação](#14-roadmap-de-implementação)
15. [Regras de Negócio](#15-regras-de-negócio)

---

## 1. Visão Geral

TaskFlow é uma aplicação web fullstack que permite equipes gerenciarem projetos por meio de boards Kanban. Cada projeto contém um board com colunas configuráveis e cards que representam tarefas. Múltiplos usuários conectados ao mesmo board veem as movimentações de cards em tempo real via WebSocket.

### Objetivos do projeto (portfólio)

- Demonstrar Spring Security com JWT + refresh token (tema mais cobrado em vagas Java BR).
- Demonstrar WebSocket/STOMP com Spring — diferencial raro em portfólios júnior.
- Demonstrar Angular Material + CDK Drag & Drop + RxJS avançado.
- Código production-ready: Docker Compose, variáveis de ambiente, testes unitários básicos.

### Personas

| Persona | Role | Capacidades |
|---|---|---|
| Administrador | `ADMIN` | CRUD de usuários, projetos, qualquer board |
| Gerente de projeto | `MANAGER` | CRUD do próprio projeto, convida membros |
| Membro da equipe | `MEMBER` | Move cards, comenta, faz upload de anexos |

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│              Angular 18 (porta 4200)                │
│   ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│   │  Auth    │ │  Board   │ │     Dashboard      │ │
│   │  Module  │ │  Module  │ │      Module        │ │
│   └────┬─────┘ └────┬─────┘ └────────┬───────────┘ │
│        │  HTTP/JWT  │  HTTP + WS      │             │
└────────┼────────────┼────────────────┼─────────────┘
         │            │                │
┌────────▼────────────▼────────────────▼─────────────┐
│                     BACKEND                         │
│            Spring Boot 3 (porta 8080)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   Auth   │ │ Projects │ │  Tasks   │            │
│  │Controller│ │Controller│ │Controller│            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │            │            │                   │
│  ┌────▼────────────▼────────────▼──────────────┐   │
│  │              Service Layer                  │   │
│  └────────────────────┬────────────────────────┘   │
│                       │                            │
│  ┌────────────────────▼────────────────────────┐   │
│  │   JPA / Hibernate  │  WebSocket Broker      │   │
│  └────────────────────┬────────────────────────┘   │
└───────────────────────┼────────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │    PostgreSQL       │
              │    (porta 5432)     │
              └────────────────────┘
```

### Fluxo de autenticação

```
Cliente                Spring Boot
  │                        │
  ├─── POST /auth/login ──►│
  │                        ├─ valida credenciais
  │                        ├─ gera accessToken (15min)
  │                        ├─ gera refreshToken (7d)
  │◄── { accessToken,      │
  │      refreshToken } ───┤
  │                        │
  ├─── GET /api/... ──────►│  (Authorization: Bearer <accessToken>)
  │◄── 200 OK ─────────────┤
  │                        │
  ├─── POST /auth/refresh ►│  (Authorization: Bearer <refreshToken>)
  │◄── { accessToken } ────┤
```

---

## 3. Stack & Dependências

### Backend — `pom.xml`

```xml
<!-- Spring Boot Starter -->
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.3.0</version>
</parent>

<dependencies>
  <!-- Web -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>

  <!-- Security -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>

  <!-- JWT (JJWT) -->
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
  </dependency>

  <!-- WebSocket -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
  </dependency>

  <!-- JPA + PostgreSQL -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
  </dependency>

  <!-- Validation -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>

  <!-- Lombok -->
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>

  <!-- MapStruct (DTOs) -->
  <dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
  </dependency>

  <!-- Testes -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

### Frontend — `package.json` (principais)

```json
{
  "dependencies": {
    "@angular/core": "^18.0.0",
    "@angular/material": "^18.0.0",
    "@angular/cdk": "^18.0.0",
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.1",
    "chart.js": "^4.4.0",
    "ng2-charts": "^6.0.0",
    "rxjs": "~7.8.0"
  }
}
```

---

## 4. Estrutura de Diretórios

### Backend

```
taskflow-api/
├── src/main/java/com/taskflow/
│   ├── TaskflowApplication.java
│   │
│   ├── config/
│   │   ├── SecurityConfig.java          # Spring Security + CORS
│   │   ├── WebSocketConfig.java         # STOMP broker config
│   │   ├── JwtAuthFilter.java           # OncePerRequestFilter
│   │   └── AuditConfig.java             # Spring Data Auditing
│   │
│   ├── auth/
│   │   ├── AuthController.java          # POST /auth/login, /register, /refresh, /logout
│   │   ├── AuthService.java
│   │   ├── JwtService.java              # geração e validação de tokens
│   │   ├── RefreshTokenService.java
│   │   └── dto/
│   │       ├── LoginRequest.java
│   │       ├── RegisterRequest.java
│   │       ├── AuthResponse.java        # { accessToken, refreshToken, user }
│   │       └── RefreshRequest.java
│   │
│   ├── user/
│   │   ├── User.java                    # @Entity
│   │   ├── UserRole.java                # enum ADMIN, MANAGER, MEMBER
│   │   ├── UserRepository.java
│   │   ├── UserService.java
│   │   ├── UserController.java          # GET /api/users, PATCH /api/users/{id}
│   │   └── dto/
│   │       ├── UserResponse.java
│   │       └── UpdateUserRequest.java
│   │
│   ├── project/
│   │   ├── Project.java                 # @Entity
│   │   ├── ProjectMember.java           # @Entity (join table com role)
│   │   ├── ProjectRepository.java
│   │   ├── ProjectService.java
│   │   ├── ProjectController.java       # CRUD /api/projects
│   │   └── dto/
│   │       ├── ProjectRequest.java
│   │       ├── ProjectResponse.java
│   │       └── AddMemberRequest.java
│   │
│   ├── board/
│   │   ├── Board.java                   # @Entity (1 board por projeto)
│   │   ├── Column.java                  # @Entity (colunas do Kanban)
│   │   ├── BoardRepository.java
│   │   ├── ColumnRepository.java
│   │   ├── BoardService.java
│   │   ├── BoardController.java         # /api/projects/{id}/board
│   │   └── dto/
│   │       ├── BoardResponse.java
│   │       ├── ColumnRequest.java
│   │       └── ColumnResponse.java
│   │
│   ├── task/
│   │   ├── Task.java                    # @Entity
│   │   ├── TaskPriority.java            # enum LOW, MEDIUM, HIGH, CRITICAL
│   │   ├── Comment.java                 # @Entity
│   │   ├── Attachment.java              # @Entity
│   │   ├── TaskRepository.java
│   │   ├── CommentRepository.java
│   │   ├── AttachmentRepository.java
│   │   ├── TaskService.java
│   │   ├── TaskController.java          # CRUD /api/tasks
│   │   ├── CommentController.java
│   │   └── dto/
│   │       ├── TaskRequest.java
│   │       ├── TaskResponse.java
│   │       ├── MoveTaskRequest.java     # { columnId, position }
│   │       ├── CommentRequest.java
│   │       └── CommentResponse.java
│   │
│   ├── websocket/
│   │   ├── BoardEventPublisher.java     # publica eventos no tópico do board
│   │   └── dto/
│   │       └── BoardEvent.java          # { type, payload } — tipo: TASK_MOVED, TASK_CREATED, etc.
│   │
│   ├── audit/
│   │   ├── AuditLog.java               # @Entity
│   │   ├── AuditLogRepository.java
│   │   ├── AuditService.java
│   │   └── AuditController.java        # GET /api/projects/{id}/audit
│   │
│   └── exception/
│       ├── GlobalExceptionHandler.java  # @RestControllerAdvice
│       ├── ResourceNotFoundException.java
│       ├── UnauthorizedException.java
│       └── ApiError.java               # { status, message, timestamp }
│
├── src/main/resources/
│   ├── application.yml
│   └── application-dev.yml
│
├── src/test/java/com/taskflow/
│   ├── auth/AuthServiceTest.java
│   ├── task/TaskServiceTest.java
│   └── board/BoardControllerTest.java   # @WebMvcTest
│
├── Dockerfile
└── pom.xml
```

### Frontend

```
taskflow-web/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts        # login, register, refresh, logout
│   │   │   │   ├── auth.guard.ts          # CanActivateFn
│   │   │   │   ├── role.guard.ts          # CanActivateFn por role
│   │   │   │   └── jwt.interceptor.ts     # adiciona Bearer token + intercepta 401
│   │   │   ├── services/
│   │   │   │   ├── project.service.ts
│   │   │   │   ├── task.service.ts
│   │   │   │   └── websocket.service.ts   # STOMP client + observables por tópico
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── project.model.ts
│   │   │       ├── board.model.ts
│   │   │       ├── task.model.ts
│   │   │       └── board-event.model.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   └── login.component.html
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       └── register.component.html
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── project-list/
│   │   │   │   ├── project-detail/
│   │   │   │   └── project-form/
│   │   │   │
│   │   │   ├── board/
│   │   │   │   ├── board.component.ts     # container principal do Kanban
│   │   │   │   ├── board.component.html
│   │   │   │   ├── column/
│   │   │   │   │   ├── column.component.ts
│   │   │   │   │   └── column.component.html
│   │   │   │   └── task-card/
│   │   │   │       ├── task-card.component.ts
│   │   │   │       └── task-card.component.html
│   │   │   │
│   │   │   ├── task-detail/
│   │   │   │   ├── task-detail.component.ts   # dialog/panel lateral
│   │   │   │   └── task-detail.component.html
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── dashboard.component.ts
│   │   │       └── dashboard.component.html
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   ├── avatar/
│   │   │   │   └── priority-badge/
│   │   │   └── pipes/
│   │   │       └── time-ago.pipe.ts
│   │   │
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── styles.scss
│
├── Dockerfile
├── nginx.conf
└── package.json
```

---

## 5. Modelo de Dados

### Diagrama de entidades

```
users
├── id           UUID PK
├── name         VARCHAR(100)
├── email        VARCHAR(150) UNIQUE
├── password     VARCHAR(255)  -- bcrypt
├── role         VARCHAR(20)   -- ADMIN | MANAGER | MEMBER
├── avatar_url   VARCHAR(500)
├── created_at   TIMESTAMP
└── updated_at   TIMESTAMP

refresh_tokens
├── id           UUID PK
├── token        VARCHAR(500) UNIQUE
├── user_id      UUID FK → users.id
├── expires_at   TIMESTAMP
└── revoked      BOOLEAN DEFAULT false

projects
├── id           UUID PK
├── name         VARCHAR(100)
├── description  TEXT
├── owner_id     UUID FK → users.id
├── created_at   TIMESTAMP
└── updated_at   TIMESTAMP

project_members
├── id           UUID PK
├── project_id   UUID FK → projects.id
├── user_id      UUID FK → users.id
└── role         VARCHAR(20)   -- MANAGER | MEMBER

boards
├── id           UUID PK
└── project_id   UUID FK → projects.id  UNIQUE

columns
├── id           UUID PK
├── board_id     UUID FK → boards.id
├── name         VARCHAR(50)
├── position     INTEGER       -- ordem das colunas
└── color        VARCHAR(7)    -- hex color

tasks
├── id           UUID PK
├── title        VARCHAR(200)
├── description  TEXT
├── column_id    UUID FK → columns.id
├── assignee_id  UUID FK → users.id (nullable)
├── reporter_id  UUID FK → users.id
├── priority     VARCHAR(20)   -- LOW | MEDIUM | HIGH | CRITICAL
├── position     INTEGER       -- ordem dentro da coluna
├── due_date     DATE (nullable)
├── created_at   TIMESTAMP
└── updated_at   TIMESTAMP

comments
├── id           UUID PK
├── task_id      UUID FK → tasks.id
├── author_id    UUID FK → users.id
├── content      TEXT
├── created_at   TIMESTAMP
└── updated_at   TIMESTAMP

attachments
├── id           UUID PK
├── task_id      UUID FK → tasks.id
├── uploaded_by  UUID FK → users.id
├── filename     VARCHAR(255)
├── file_path    VARCHAR(500)
├── file_size    BIGINT
├── content_type VARCHAR(100)
└── created_at   TIMESTAMP

audit_logs
├── id           UUID PK
├── project_id   UUID FK → projects.id
├── user_id      UUID FK → users.id
├── action       VARCHAR(50)   -- TASK_CREATED | TASK_MOVED | COMMENT_ADDED etc.
├── entity_type  VARCHAR(50)
├── entity_id    UUID
├── details      JSONB         -- snapshot antes/depois
└── created_at   TIMESTAMP
```

### Entidade `Task.java` (referência)

```java
@Entity
@Table(name = "tasks")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", nullable = false)
    private Column column;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(nullable = false)
    private Integer position;

    private LocalDate dueDate;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

---

## 6. Autenticação & Autorização

### Configuração Spring Security

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**", "/ws/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### JwtService

```java
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    private static final long ACCESS_TOKEN_EXPIRY  = 1000L * 60 * 15;      // 15 min
    private static final long REFRESH_TOKEN_EXPIRY = 1000L * 60 * 60 * 24 * 7; // 7 dias

    public String generateAccessToken(User user) {
        return Jwts.builder()
            .subject(user.getEmail())
            .claim("role", user.getRole().name())
            .claim("userId", user.getId().toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY))
            .signWith(getSigningKey())
            .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
            .subject(user.getEmail())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRY))
            .signWith(getSigningKey())
            .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload()
        );
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
```

### Uso de `@PreAuthorize`

```java
// Apenas o owner do projeto ou ADMIN podem deletar
@DeleteMapping("/{id}")
@PreAuthorize("@projectSecurity.isOwner(#id, authentication) or hasRole('ADMIN')")
public ResponseEntity<Void> deleteProject(@PathVariable UUID id) { ... }

// Apenas membros do projeto podem ver o board
@GetMapping("/projects/{projectId}/board")
@PreAuthorize("@projectSecurity.isMember(#projectId, authentication)")
public ResponseEntity<BoardResponse> getBoard(@PathVariable UUID projectId) { ... }
```

---

## 7. API REST

### Prefixo base: `/api/v1`

#### Auth — sem prefixo `/api`

| Método | Endpoint | Body | Resposta | Descrição |
|---|---|---|---|---|
| POST | `/auth/register` | `RegisterRequest` | `AuthResponse` | Cadastro |
| POST | `/auth/login` | `LoginRequest` | `AuthResponse` | Login |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken }` | Renova access token |
| POST | `/auth/logout` | `{ refreshToken }` | 204 | Revoga refresh token |

#### Usuários

| Método | Endpoint | Roles | Descrição |
|---|---|---|---|
| GET | `/api/v1/users` | ADMIN | Lista todos os usuários |
| GET | `/api/v1/users/me` | Qualquer | Perfil do usuário logado |
| PATCH | `/api/v1/users/me` | Qualquer | Atualiza nome e avatar |
| PATCH | `/api/v1/users/{id}/role` | ADMIN | Altera role de um usuário |

#### Projetos

| Método | Endpoint | Roles | Descrição |
|---|---|---|---|
| GET | `/api/v1/projects` | Qualquer | Projetos do usuário logado |
| POST | `/api/v1/projects` | MANAGER, ADMIN | Cria projeto |
| GET | `/api/v1/projects/{id}` | Membro | Detalhes do projeto |
| PUT | `/api/v1/projects/{id}` | Owner, ADMIN | Atualiza projeto |
| DELETE | `/api/v1/projects/{id}` | Owner, ADMIN | Remove projeto |
| POST | `/api/v1/projects/{id}/members` | Owner, MANAGER | Adiciona membro |
| DELETE | `/api/v1/projects/{id}/members/{userId}` | Owner, MANAGER | Remove membro |

#### Board & Colunas

| Método | Endpoint | Roles | Descrição |
|---|---|---|---|
| GET | `/api/v1/projects/{id}/board` | Membro | Board completo com tasks |
| POST | `/api/v1/boards/{boardId}/columns` | Manager | Cria coluna |
| PATCH | `/api/v1/columns/{id}` | Manager | Renomeia/recolore coluna |
| PATCH | `/api/v1/columns/{id}/position` | Manager | Reordena coluna |
| DELETE | `/api/v1/columns/{id}` | Manager | Remove coluna (move tasks para Backlog) |

#### Tasks

| Método | Endpoint | Body | Descrição |
|---|---|---|---|
| POST | `/api/v1/tasks` | `TaskRequest` | Cria task |
| GET | `/api/v1/tasks/{id}` | — | Detalhes completos (com comentários e anexos) |
| PUT | `/api/v1/tasks/{id}` | `TaskRequest` | Atualiza task |
| PATCH | `/api/v1/tasks/{id}/move` | `MoveTaskRequest` | Move para outra coluna/posição |
| DELETE | `/api/v1/tasks/{id}` | — | Remove task |

#### Comentários

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/v1/tasks/{taskId}/comments` | Adiciona comentário |
| PATCH | `/api/v1/comments/{id}` | Edita (apenas autor) |
| DELETE | `/api/v1/comments/{id}` | Remove (autor ou ADMIN) |

#### Auditoria

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/v1/projects/{id}/audit` | Histórico paginado de ações |

### DTOs de referência

```java
// TaskRequest.java
public record TaskRequest(
    @NotBlank String title,
    String description,
    @NotNull UUID columnId,
    UUID assigneeId,
    @NotNull TaskPriority priority,
    LocalDate dueDate
) {}

// MoveTaskRequest.java
public record MoveTaskRequest(
    @NotNull UUID columnId,
    @NotNull Integer position
) {}

// TaskResponse.java
public record TaskResponse(
    UUID id,
    String title,
    String description,
    ColumnInfo column,
    UserInfo assignee,
    UserInfo reporter,
    TaskPriority priority,
    Integer position,
    LocalDate dueDate,
    List<CommentResponse> comments,
    List<AttachmentInfo> attachments,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
```

### Padrão de erro

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Task with id 'abc-123' not found",
  "timestamp": "2024-11-20T14:32:00Z",
  "path": "/api/v1/tasks/abc-123"
}
```

---

## 8. WebSocket (STOMP)

### Configuração

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

### Tópicos e eventos

| Tópico | Quem assina | Eventos publicados |
|---|---|---|
| `/topic/board/{boardId}` | Qualquer membro com board aberto | `TASK_CREATED`, `TASK_MOVED`, `TASK_UPDATED`, `TASK_DELETED` |
| `/topic/board/{boardId}/comments` | Mesmos assinantes | `COMMENT_ADDED`, `COMMENT_DELETED` |

### Estrutura do evento

```java
// BoardEvent.java
public record BoardEvent(
    String type,        // "TASK_MOVED"
    String boardId,
    Object payload      // TaskResponse ou apenas IDs
) {}
```

### Publisher (backend)

```java
@Service
@RequiredArgsConstructor
public class BoardEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishTaskMoved(UUID boardId, TaskResponse task) {
        messagingTemplate.convertAndSend(
            "/topic/board/" + boardId,
            new BoardEvent("TASK_MOVED", boardId.toString(), task)
        );
    }

    public void publishTaskCreated(UUID boardId, TaskResponse task) {
        messagingTemplate.convertAndSend(
            "/topic/board/" + boardId,
            new BoardEvent("TASK_CREATED", boardId.toString(), task)
        );
    }
}
```

### Subscriber (Angular)

```typescript
// websocket.service.ts
@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private client = new Client({
    brokerURL: environment.wsUrl,  // ws://localhost:8080/ws
    reconnectDelay: 5000,
  });

  connect(): void {
    this.client.activate();
  }

  subscribeToBoardEvents(boardId: string): Observable<BoardEvent> {
    return new Observable(observer => {
      const sub = this.client.subscribe(
        `/topic/board/${boardId}`,
        (msg) => observer.next(JSON.parse(msg.body))
      );
      return () => sub.unsubscribe();
    });
  }
}

// board.component.ts — consumindo eventos
this.wsService.subscribeToBoardEvents(this.boardId)
  .pipe(takeUntilDestroyed())
  .subscribe(event => {
    switch (event.type) {
      case 'TASK_MOVED':    this.handleTaskMoved(event.payload); break;
      case 'TASK_CREATED':  this.handleTaskCreated(event.payload); break;
      case 'TASK_DELETED':  this.handleTaskDeleted(event.payload); break;
    }
  });
```

---

## 9. Frontend — Módulos Angular

### Rotas

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/login/login.component') },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component') },
    ]
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    children: [
      { path: '',        loadComponent: () => import('./features/projects/project-list/project-list.component') },
      { path: ':id',     loadComponent: () => import('./features/projects/project-detail/project-detail.component') },
      { path: ':id/board', loadComponent: () => import('./features/board/board.component') },
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
  },
  { path: '**', redirectTo: '/projects' }
];
```

### JWT Interceptor

```typescript
// jwt.interceptor.ts
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(({ accessToken }) => {
            return next(req.clone({
              setHeaders: { Authorization: `Bearer ${accessToken}` }
            }));
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
```

### Board Component — Drag & Drop CDK

```typescript
// board.component.ts
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [DragDropModule, MatButtonModule, ...],
})
export class BoardComponent {
  board = signal<BoardResponse | null>(null);

  drop(event: CdkDragDrop<Task[]>, targetColumn: Column): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(targetColumn.tasks, event.previousIndex, event.currentIndex);
    } else {
      const sourceColumn = this.findColumnByContainer(event.previousContainer);
      transferArrayItem(sourceColumn.tasks, targetColumn.tasks, event.previousIndex, event.currentIndex);
    }

    // Persiste no backend
    this.taskService.moveTask(event.item.data.id, {
      columnId: targetColumn.id,
      position: event.currentIndex,
    }).subscribe();
    // O evento WebSocket vai sincronizar os outros usuários
  }
}
```

### Dashboard — Métricas com Chart.js

```typescript
// Gráficos disponíveis no dashboard
const charts = [
  { id: 'tasks-by-status',    type: 'doughnut', label: 'Tasks por status' },
  { id: 'tasks-by-priority',  type: 'bar',      label: 'Tasks por prioridade' },
  { id: 'tasks-by-member',    type: 'bar',      label: 'Tasks por membro' },
  { id: 'tasks-over-time',    type: 'line',      label: 'Criações por semana' },
];
```

---

## 10. Upload de Arquivos

### Backend — Multipart endpoint

```java
@PostMapping("/tasks/{taskId}/attachments")
public ResponseEntity<AttachmentInfo> uploadAttachment(
    @PathVariable UUID taskId,
    @RequestParam("file") MultipartFile file,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // Valida tamanho (máx 10MB) e tipo de arquivo
    // Salva em /uploads/{taskId}/{uuid}_{filename}
    // Persiste Attachment no banco
    return ResponseEntity.ok(attachmentService.save(taskId, file, userDetails));
}

// application.yml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

### Frontend — Upload com progresso

```typescript
uploadFile(taskId: string, file: File): Observable<number> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<AttachmentInfo>(
    `/api/v1/tasks/${taskId}/attachments`,
    formData,
    { reportProgress: true, observe: 'events' }
  ).pipe(
    map(event => {
      if (event.type === HttpEventType.UploadProgress) {
        return Math.round(100 * event.loaded / (event.total ?? 1));
      }
      return 100;
    })
  );
}
```

---

## 11. Auditoria

Toda ação relevante registra um `AuditLog` automaticamente via AOP:

```java
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;

    @AfterReturning(
        pointcut = "@annotation(Auditable)",
        returning = "result"
    )
    public void logAction(JoinPoint jp, Object result) {
        Auditable auditable = getAnnotation(jp);
        auditService.log(
            auditable.action(),
            auditable.entityType(),
            extractId(result)
        );
    }
}

// Uso nas actions
@Auditable(action = "TASK_CREATED", entityType = "TASK")
public TaskResponse createTask(TaskRequest request, UserDetails user) { ... }

@Auditable(action = "TASK_MOVED", entityType = "TASK")
public TaskResponse moveTask(UUID id, MoveTaskRequest request) { ... }
```

---

## 12. Docker & Infraestrutura

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_USER: taskflow
      POSTGRES_PASSWORD: taskflow123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskflow"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: ./taskflow-api
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/taskflow
      SPRING_DATASOURCE_USERNAME: taskflow
      SPRING_DATASOURCE_PASSWORD: taskflow123
      JWT_SECRET: ${JWT_SECRET}
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build: ./taskflow-web
    ports:
      - "4200:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

### `Dockerfile` — Backend

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### `Dockerfile` — Frontend

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/taskflow-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### `nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para a API
    location /api/ {
        proxy_pass http://api:8080;
        proxy_set_header Host $host;
    }

    # Proxy para WebSocket
    location /ws/ {
        proxy_pass http://api:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 13. Variáveis de Ambiente

### Backend — `application.yml`

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/taskflow}
    username: ${SPRING_DATASOURCE_USERNAME:taskflow}
    password: ${SPRING_DATASOURCE_PASSWORD:taskflow123}
  jpa:
    hibernate:
      ddl-auto: ${DDL_AUTO:update}   # usar 'validate' em produção
    show-sql: false

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

jwt:
  secret: ${JWT_SECRET}    # mínimo 256 bits — gere com: openssl rand -base64 32

server:
  port: 8080

upload:
  dir: ${UPLOAD_DIR:./uploads}

logging:
  level:
    com.taskflow: INFO
```

### Frontend — `environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  wsUrl:  'http://localhost:8080/ws',
};
```

---

## 14. Roadmap de Implementação

### Fase 1 — Base (semana 1–2)

- [ ] Setup do projeto Spring Boot com estrutura de pacotes
- [ ] Configurar PostgreSQL + Docker Compose
- [ ] Entidades `User`, `Project`, `Board`, `Column`, `Task` com JPA
- [ ] `application.yml` com profiles dev/prod
- [ ] Implementar `AuthController` — register e login com JWT
- [ ] Implementar `JwtAuthFilter` e `SecurityConfig`
- [ ] Implementar refresh token e logout (revogação)
- [ ] CRUD completo de `Project` e `Column`

### Fase 2 — Core (semana 2–3)

- [ ] CRUD de `Task` com validações
- [ ] Endpoint `PATCH /tasks/{id}/move` com reordenação de posições
- [ ] Configurar WebSocket (`WebSocketConfig`)
- [ ] `BoardEventPublisher` publicando em `/topic/board/{id}`
- [ ] Endpoint `GET /projects/{id}/board` retornando board completo
- [ ] `@PreAuthorize` em todos os endpoints sensíveis
- [ ] `GlobalExceptionHandler` com respostas padronizadas

### Fase 3 — Funcionalidades extras (semana 3–4)

- [ ] Comentários (CRUD)
- [ ] Upload de anexos (Multipart + salvar em disco/S3)
- [ ] Auditoria com `@Aspect`
- [ ] Paginação no endpoint de auditoria
- [ ] Testes: `AuthServiceTest`, `TaskServiceTest`, `BoardControllerTest`

### Fase 4 — Frontend (semana 4–5)

- [ ] Setup Angular 18 standalone + Angular Material
- [ ] `AuthService` + `JwtInterceptor` com auto-refresh
- [ ] `AuthGuard` e `RoleGuard`
- [ ] Telas de login e registro
- [ ] Lista de projetos e criação
- [ ] Board Kanban com CDK Drag & Drop
- [ ] `WebsocketService` + integração com board (eventos em tempo real)
- [ ] Task detail (dialog lateral com comentários e uploads)
- [ ] Dashboard com Chart.js

### Fase 5 — Finalização (semana 5–6)

- [ ] Dockerfiles do backend e frontend
- [ ] `nginx.conf` com proxy e SPA fallback
- [ ] `docker-compose.yml` orquestrando tudo
- [ ] README detalhado com gif do board em uso
- [ ] Deploy gratuito: Railway (API + DB) + Vercel ou Netlify (front)
- [ ] Variáveis de ambiente documentadas no README

---

## 15. Regras de Negócio

- Um usuário com role `MEMBER` não pode criar nem deletar projetos.
- Apenas o `owner` do projeto ou um `ADMIN` pode deletar o projeto.
- Um `MANAGER` pode adicionar e remover membros do seu próprio projeto.
- Ao deletar uma coluna, todas as tasks dela devem ser movidas para a primeira coluna do board (geralmente "Backlog") antes da exclusão.
- O campo `position` de tasks dentro de uma coluna deve ser sempre recalculado ao mover (sem gaps): 0, 1, 2, 3...
- O tamanho máximo de um arquivo de anexo é 10MB. Tipos permitidos: pdf, png, jpg, gif, txt, md, docx, xlsx.
- Um refresh token só pode ser usado uma vez. Após uso, é invalidado e um novo par (access + refresh) é gerado.
- Refresh tokens expiram em 7 dias. Se expirado, o usuário deve logar novamente.
- Eventos WebSocket só chegam para usuários que são membros do projeto daquele board.
- Todo comentário pode ser editado apenas pelo seu autor. Apenas o autor ou um `ADMIN` pode deletar.

---

*SPEC gerado para o projeto TaskFlow — portfólio de desenvolvedor júnior Java + Angular.*
*Stack: Java 21 · Spring Boot 3.3 · Angular 18 · PostgreSQL 16 · Docker Compose*
