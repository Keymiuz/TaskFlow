# TaskFlow

TaskFlow is a full-stack Kanban platform for teams, built as a monorepo with Spring Boot and Angular.

## Features

- JWT authentication with refresh tokens
- Role-based access control for admin/member users
- Audit log support
- WebSocket plumbing for real-time board updates
- PostgreSQL persistence
- Docker Compose setup for local development

## Tech stack

### Backend

- Java 21
- Spring Boot 3.5
- Spring Security
- Spring Data JPA
- PostgreSQL
- WebSocket
- JWT

### Frontend

- Angular 18
- Angular Material
- STOMP + SockJS
- Chart.js

## Repository structure

```text
TaskFlow/
├── taskflow-api/   # Spring Boot API
├── taskflow-web/   # Angular SPA
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick start with Docker

1. Create your local environment file.

```bash
cp .env.example .env
```

2. Start the full stack.

```bash
docker compose up --build
```

3. Open the application:

- Frontend: http://localhost:4200
- API: http://localhost:8080
- PostgreSQL: localhost:5432

### Default development access

- Email: `admin@taskflow.com`
- Password: `admin123`

> The dev profile seeds this user automatically when the database is empty.

## Run without Docker

### Backend

```bash
cd taskflow-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend

```bash
cd taskflow-web
npm install
npm start
```

## Environment variables

| Variable | Description |
| --- | --- |
| `JWT_SECRET` | Secret used to sign access and refresh tokens |
| `SPRING_PROFILES_ACTIVE` | Spring profile to activate (`dev` recommended locally) |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `UPLOAD_DIR` | Directory used for file uploads |

The `.env.example` file contains the minimum required values for local development.

## Release and branching strategy

- `main` → stable, release-ready branch
- `develop` → integration branch for daily development
- `feature/*` → optional topic branches for new work

Recommended release flow:

1. Merge work into `develop`
2. Validate the stack locally
3. Merge `develop` into `main`
4. Tag the release, for example `v1.0.0`

## Deployment notes

- **Vercel is a good fit for `taskflow-web` only.**
- The Angular app can be deployed to Vercel as a static frontend.
- The Spring Boot API must be hosted elsewhere, such as Render, Railway, Fly.io, VPS, or AWS.
- If you deploy the frontend on Vercel, update the API URL to point to your hosted backend instead of `localhost`.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
