# HealthGuard AI – Backend (Phase 1: Foundation)

Spring Boot 3.x / Java 21 / Maven backend foundation for the HealthGuard AI
project. This phase sets up project structure, configuration, and a single
health-check endpoint. No domain entities, auth, or business logic yet.

## Project Structure

```
com.healthguard
├── config       CORS, Security, Jackson configuration
├── controller   REST controllers (HealthController)
├── service      Business logic (HealthService)
├── repository   (empty – reserved for Phase 2+)
├── entity       (empty – reserved for Phase 2+)
├── dto          Request/response objects
├── security     (empty – reserved for JWT in Phase 2)
├── exception    Custom exceptions + GlobalExceptionHandler
├── util         (empty – reserved for shared helpers)
├── mapper       (empty – reserved for entity <-> DTO mapping)
└── HealthGuardApplication
```

## Prerequisites

- JDK 21
- Maven 3.9+
- PostgreSQL running locally (or reachable) with a database created,
  e.g. `healthguard_db`

## Configuration

Database credentials and the frontend origin are read from environment
variables (see `src/main/resources/application.properties`):

| Variable              | Default                                              |
|-----------------------|-------------------------------------------------------|
| `DB_URL`              | `jdbc:postgresql://localhost:5432/healthguard_db`     |
| `DB_USERNAME`         | `your_db_username`                                    |
| `DB_PASSWORD`         | `your_db_password`                                    |
| `SERVER_PORT`         | `8080`                                                |
| `CORS_ALLOWED_ORIGINS`| `http://localhost:5173` (matches the Vite dev server) |

Set real values before running, e.g.:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/healthguard_db
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
```

## Build & Run

```bash
mvn clean install
mvn spring-boot:run
```

The app starts on `http://localhost:8080` by default.

## Verify

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{
  "status": "UP",
  "service": "HealthGuard Backend",
  "version": "1.0"
}
```

The frontend's `apiClient` (`src/api/axios.js`) points at `/api` by default
(or `VITE_API_BASE_URL` if set), so once you run the frontend dev server on
port 5173 with `VITE_API_BASE_URL=http://localhost:8080/api`, it will be able
to reach this endpoint directly.

## Notes on this phase

- Spring Security is configured with `permitAll()` on every endpoint so the
  frontend can integrate immediately. JWT authentication will replace this
  in the next phase without restructuring `SecurityConfig`.
- `ddl-auto=update` is enabled but there are no entities yet, so no schema
  changes will occur until Phase 2 introduces JPA entities.
- No hardcoded credentials — all DB config comes from environment variables
  with local-dev-friendly defaults.
