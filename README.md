# TaskFlow

TaskFlow is a fullstack Kanban project for teams, built with Spring Boot 3 and Angular 18.

## Current foundation

- Spring Boot backend scaffold with JWT auth, refresh-token persistence, audit storage, and WebSocket plumbing
- Angular workspace scaffold for the UI shell
- PostgreSQL and Docker Compose ready for local development

## Run locally

1. Copy the environment file and fill `JWT_SECRET`.

```bash
cp .env.example .env
```

2. Start the stack.

```bash
docker-compose up --build
```

3. Open:

- Frontend: http://localhost:4200
- API: http://localhost:8080
- PostgreSQL: localhost:5432

## Backend without Docker

```bash
cd taskflow-api
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Frontend without Docker

```bash
cd taskflow-web
npm install
npm start
```

## Notes

- `JWT_SECRET` is required and must be provided through environment variables.
- The development profile seeds `admin@taskflow.com` with password `admin123`.
