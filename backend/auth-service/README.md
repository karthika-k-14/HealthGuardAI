# HealthGuard AI - Auth Service

Production-ready Authentication Microservice for **HealthGuard AI**, built with **Spring Boot 3.5.2**, **Java 21**, **Spring Security 6**, and **JJWT 0.12.6**.

---

## 📖 Project Overview

`auth-service` is the central authentication microservice for the HealthGuard AI platform. It is responsible for:

- Registering new platform users (citizens, health workers, and administrators) with encrypted (BCrypt) passwords.
- Authenticating users and issuing **stateless JWT (HS256)** access tokens valid for 24 hours.
- Validating JWTs on every protected request via a custom `OncePerRequestFilter`.
- Exposing an authenticated `/api/auth/profile` endpoint that returns the current user's details.
- Supporting five distinct user roles: `ADMIN`, `CITIZEN`, `ASHA_WORKER`, `PHARMACIST`, `HEALTH_OFFICER`.

All responses (success and error) are wrapped in a consistent `ApiResponse<T>` envelope, and all errors are handled centrally by a `@RestControllerAdvice` global exception handler.

---

## 🚀 Tech Stack

- **Java Version**: 21
- **Framework**: Spring Boot 3.5.2
- **Security**: Spring Security 6 (Stateless JWT Authentication)
- **JWT**: JJWT 0.12.6 (`io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson`)
- **Database**: PostgreSQL (`healthguard_db`)
- **ORM**: Spring Data JPA / Hibernate
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Utility**: Lombok (Constructor injection used exclusively)

---

## 📁 Package Architecture (`com.healthguard.auth`)

```text
com.healthguard.auth
│
├── config                # Spring Security & App Configurations
├── controller            # Auth REST Endpoints (/api/auth)
├── dto                   # Request & Response DTOs
├── entity                # User entity & Role Enum
├── exception             # GlobalExceptionHandler & Custom Exceptions
├── repository            # Spring Data JPA UserRepository
├── security              # JwtService, JwtAuthenticationFilter, CustomUserDetailsService
├── service               # AuthService interface
├── service.impl          # AuthServiceImpl implementation
└── util                  # Utility helper classes
```

---

## ⚙️ Database & Configuration

Database connection settings in `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8081

# Database Configuration (PostgreSQL Placeholders)
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/healthguard_db
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA / Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration (HS256 256-bit Key, 24-hour Expiration)
jwt.secret=${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

---

## 🔐 User Roles

- `ADMIN`
- `CITIZEN`
- `ASHA_WORKER`
- `PHARMACIST`
- `HEALTH_OFFICER`

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Get profile of logged-in user |

### Standard Response Envelope

```json
{
  "success": true,
  "message": "User logged in successfully",
  "timestamp": "2026-08-06T19:11:00",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "userId": 1,
    "email": "user@healthguard.com",
    "role": "CITIZEN"
  }
}
```

---

## 🛠️ Building & Running

### Prerequisites
- JDK 21 installed
- Maven 3.8+ installed (or use `./mvnw`)
- PostgreSQL database (`healthguard_db`) running on port 5432

### Build Project
```bash
mvn clean compile
```

### Run Application
```bash
mvn spring-boot:run
```

The service starts on **http://localhost:8081**.

### Run Tests
```bash
mvn test
```
Tests run against an in-memory **H2** database (`src/test/resources/application-test.properties`), so no PostgreSQL instance is required to run `mvn test`.

### Import into Spring Tool Suite (STS)
1. `File` → `Import` → `Maven` → `Existing Maven Projects`.
2. Browse to the `auth-service` folder and select the `pom.xml`.
3. Wait for Maven to resolve dependencies, then run `AuthServiceApplication.java` as a Spring Boot App.

---

## 📮 Postman Collection

Import the included Postman collection located at:
`postman/HealthGuard-AI-Auth-Service.postman_collection.json`

### How to test
1. Open Postman → `Import` → select the collection file above.
2. The collection includes a `baseUrl` variable (defaults to `http://localhost:8081`) — update it if your service runs on a different host/port.
3. Run **Register** (or **Login** if the user already exists) — a test script automatically captures the returned JWT into the collection's `token` variable.
4. Run **Get Profile** — it automatically sends `Authorization: Bearer {{token}}` using the captured token.

| Request | Method | Endpoint | Auth Required |
| :--- | :--- | :--- | :--- |
| Register | `POST` | `/api/auth/register` | No |
| Login | `POST` | `/api/auth/login` | No |
| Get Profile | `GET` | `/api/auth/profile` | Yes (Bearer JWT) |
