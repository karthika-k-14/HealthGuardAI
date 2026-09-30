# HealthGuard AI - Community Service (`community-service`)

Production-ready microservice built with **Java 21** and **Spring Boot 3.5.2** for managing community healthcare resources, ASHA workers, and Primary Health Centres (PHCs) within the HealthGuard AI ecosystem.

---

## 🚀 Overview

The `community-service` microservice manages ASHA workers and Primary Health Centres (PHCs). It provides REST endpoints protected by **Spring Security 6** with **JWT authentication** issued by `auth-service`.

---

## 🛠️ Technologies Used

- **Java Version:** 21
- **Spring Boot Version:** 3.5.2
- **Build Tool:** Maven (Wrapper included)
- **Database:** PostgreSQL (`healthguard_community_db`)
- **Security:** Spring Security 6, JJWT 0.12.6
- **Validation:** Jakarta Bean Validation
- **Utilities:** Lombok, Spring Boot DevTools, Spring Boot Actuator

---

## 📁 Folder Structure

```text
backend/community-service/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── postman/
│   └── Community_Service.postman_collection.json
├── src/
│   ├── main/
│   │   ├── java/com/healthguard/community/
│   │   │   ├── CommunityServiceApplication.java
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   │   ├── ASHAWorkerController.java
│   │   │   │   └── PHCController.java
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── ASHAWorkerRequest.java
│   │   │   │   ├── ASHAWorkerResponse.java
│   │   │   │   ├── PHCRequest.java
│   │   │   │   ├── PHCResponse.java
│   │   │   │   ├── UpdateASHAWorkerRequest.java
│   │   │   │   └── UpdatePHCRequest.java
│   │   │   ├── entity/
│   │   │   │   ├── ASHAWorker.java
│   │   │   │   └── PHC.java
│   │   │   ├── exception/
│   │   │   │   ├── DuplicateResourceException.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── repository/
│   │   │   │   ├── ASHAWorkerRepository.java
│   │   │   │   └── PHCRepository.java
│   │   │   ├── security/
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── service/
│   │   │   │   ├── ASHAWorkerService.java
│   │   │   │   ├── PHCService.java
│   │   │   │   └── impl/
│   │   │   │       ├── ASHAWorkerServiceImpl.java
│   │   │   │       └── PHCServiceImpl.java
│   │   │   └── util/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       ├── java/com/healthguard/community/
│       │   └── CommunityServiceApplicationTests.java
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
2. Create database `healthguard_community_db`:
   ```sql
   CREATE DATABASE healthguard_community_db;
   ```
3. Environment variables (optional - defaults to user `postgres` and password `postgres`):
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

## ⚙️ How to Run

### Run Unit and Integration Tests
```bash
mvn clean test
```

### Run Application
```bash
mvn spring-boot:run
```
*The service will start on port `8083`.*

---

## 📡 API Endpoints

### ASHA Worker Endpoints (`/api/asha`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/asha` | `Bearer <JWT>` | Register a new ASHA worker |
| `GET` | `/api/asha` | `Bearer <JWT>` | List all ASHA workers (optional `?district=`) |
| `GET` | `/api/asha/{id}` | `Bearer <JWT>` | Get ASHA worker by ID |
| `PUT` | `/api/asha/{id}` | `Bearer <JWT>` | Update ASHA worker details |
| `DELETE` | `/api/asha/{id}` | `Bearer <JWT>` | Delete ASHA worker |

### Primary Health Centre (PHC) Endpoints (`/api/phc`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/phc` | `Bearer <JWT>` | Register a new PHC |
| `GET` | `/api/phc` | `Bearer <JWT>` | List all PHCs (optional `?district=`) |
| `GET` | `/api/phc/{id}` | `Bearer <JWT>` | Get PHC by ID |
| `PUT` | `/api/phc/{id}` | `Bearer <JWT>` | Update PHC details |
| `DELETE` | `/api/phc/{id}` | `Bearer <JWT>` | Delete PHC |

### Actuator

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/actuator/health` | None | Service health check |

---

## 🧪 Postman Testing

1. Open Postman.
2. Import `postman/Community_Service.postman_collection.json`.
3. Configure `jwt_token` in collection environment variables.
4. Execute requests against `http://localhost:8083`.
