# HealthGuard AI - Citizen Service (`citizen-service`)

Production-ready microservice built with **Java 21** and **Spring Boot 3.5.2** for managing citizen health profiles within the HealthGuard AI ecosystem.

---

## 🚀 Overview

The `citizen-service` microservice manages citizen registration details, personal demographics, emergency contact info, and medical metadata. It integrates seamlessly with `auth-service` by validating JWT tokens on protected REST endpoints.

---

## 🛠️ Tech Stack & Dependencies

- **Java Version:** 21
- **Spring Boot Version:** 3.5.2
- **Build Tool:** Maven (Wrapper included)
- **Database:** PostgreSQL (`healthguard_citizen_db`)
- **Security:** Spring Security 6, JJWT 0.12.6
- **Validation:** Jakarta Bean Validation
- **Utilities:** Lombok, Spring Boot DevTools, Spring Boot Actuator

---

## 📁 Project Directory Structure

```text
backend/citizen-service/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── postman/
│   └── Citizen_Service.postman_collection.json
├── src/
│   ├── main/
│   │   ├── java/com/healthguard/citizen/
│   │   │   ├── CitizenServiceApplication.java
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   │   └── CitizenController.java
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── CitizenRequest.java
│   │   │   │   ├── CitizenResponse.java
│   │   │   │   └── UpdateCitizenRequest.java
│   │   │   ├── entity/
│   │   │   │   └── Citizen.java
│   │   │   ├── exception/
│   │   │   │   ├── DuplicateResourceException.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── repository/
│   │   │   │   └── CitizenRepository.java
│   │   │   ├── security/
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── service/
│   │   │   │   ├── CitizenService.java
│   │   │   │   └── impl/
│   │   │   │       └── CitizenServiceImpl.java
│   │   │   └── util/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       ├── java/com/healthguard/citizen/
│       │   └── CitizenServiceApplicationTests.java
│       └── resources/
│           └── application-test.properties
├── .classpath
├── .factorypath
├── .gitignore
├── .project
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

---

## 🗄️ Database Setup

1. Make sure PostgreSQL is running on port `5432`.
2. Create database `healthguard_citizen_db`:
   ```sql
   CREATE DATABASE healthguard_citizen_db;
   ```
3. Set environment variables (optional - defaults to user `postgres` and password `postgres`):
   - Windows PowerShell:
     ```powershell
     $env:DB_USERNAME="postgres"
     $env:DB_PASSWORD="your_password"
     ```
   - Linux/macOS:
     ```bash
     export DB_USERNAME="postgres"
     export DB_PASSWORD="your_password"
     ```

---

## ⚙️ How to Build and Run

### Run Unit/Integration Tests
```bash
mvn clean test
```

### Run Application
```bash
mvn spring-boot:run
```
*The service will start on port `8082`.*

---

## 📡 API Endpoints

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/citizens` | `Bearer <JWT>` | Create a new citizen profile |
| `GET` | `/api/citizens/{userId}` | `Bearer <JWT>` | Get citizen details by user ID |
| `PUT` | `/api/citizens/{userId}` | `Bearer <JWT>` | Update citizen profile |
| `DELETE` | `/api/citizens/{userId}` | `Bearer <JWT>` | Delete citizen profile |
| `GET` | `/api/citizens/profile/{userId}` | `Bearer <JWT>` | Get citizen full profile |
| `GET` | `/actuator/health` | None (Permit All) | Health Check Endpoint |

---

## 🧪 Postman Testing

1. Open Postman.
2. Import `postman/Citizen_Service.postman_collection.json`.
3. Set the `jwt_token` variable in Postman collection settings to the token received from `auth-service`.
4. Execute requests!
