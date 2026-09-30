# HealthGuard AI - AI Service (`ai-service`)

Production-ready microservice built with **Java 21** and **Spring Boot 3.5.2** providing AI-driven conversational health assistance and symptom risk assessment within the HealthGuard AI ecosystem.

---

## 🚀 Overview

The `ai-service` microservice manages AI chatbot interactions and symptom assessments. It persists history records in PostgreSQL (`healthguard_ai_db`) and features a pluggable AI client abstraction (`AiModelClient`). Currently, it operates with a smart mock AI client (`MockAiModelClient`) designed for plug-and-play integration with external LLM providers (e.g. OpenAI, Google Gemini) in the future.

---

## 🛠️ Technologies Used

- **Java Version:** 21
- **Spring Boot Version:** 3.5.2
- **Build Tool:** Maven (Wrapper included)
- **Database:** PostgreSQL (`healthguard_ai_db`)
- **Security:** Spring Security 6, JJWT 0.12.6
- **Reactive & Async:** Spring WebFlux (`spring-boot-starter-webflux`)
- **Validation:** Jakarta Bean Validation
- **Utilities:** Lombok, Spring Boot DevTools, Spring Boot Actuator

---

## 📁 Folder Structure

```text
backend/ai-service/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── postman/
│   └── AI_Service.postman_collection.json
├── src/
│   ├── main/
│   │   ├── java/com/healthguard/ai/
│   │   │   ├── AiServiceApplication.java
│   │   │   ├── client/
│   │   │   │   ├── AiModelClient.java
│   │   │   │   └── MockAiModelClient.java
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   │   ├── ChatController.java
│   │   │   │   └── SymptomController.java
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── ChatRequest.java
│   │   │   │   ├── ChatResponse.java
│   │   │   │   ├── SymptomRequest.java
│   │   │   │   └── SymptomResponse.java
│   │   │   ├── entity/
│   │   │   │   ├── ChatHistory.java
│   │   │   │   └── SymptomAssessment.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── repository/
│   │   │   │   ├── ChatHistoryRepository.java
│   │   │   │   └── SymptomAssessmentRepository.java
│   │   │   ├── security/
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── service/
│   │   │   │   ├── ChatService.java
│   │   │   │   ├── SymptomService.java
│   │   │   │   └── impl/
│   │   │   │       ├── ChatServiceImpl.java
│   │   │   │       └── SymptomServiceImpl.java
│   │   │   └── util/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       ├── java/com/healthguard/ai/
│       │   └── AiServiceApplicationTests.java
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
2. Create database `healthguard_ai_db`:
   ```sql
   CREATE DATABASE healthguard_ai_db;
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

## ⚙️ How to Run Instructions

### Run Unit and Integration Tests
```bash
mvn clean test
```

### Run Application
```bash
mvn spring-boot:run
```
*The service will start on port `8084`.*

---

## 📡 API Endpoints

### AI Chat Endpoints (`/api/ai/chat`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | `Bearer <JWT>` | Send question & receive AI health response |
| `GET` | `/api/ai/chat/{userId}` | `Bearer <JWT>` | Get user chat history |

### Symptom Assessment Endpoints (`/api/ai/symptoms`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/symptoms` | `Bearer <JWT>` | Submit symptoms & receive AI risk assessment |
| `GET` | `/api/ai/symptoms/{userId}` | `Bearer <JWT>` | Get user symptom assessment history |

### Actuator

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/actuator/health` | None | Service health check |

---

## 🧪 Postman Testing

1. Open Postman.
2. Import `postman/AI_Service.postman_collection.json`.
3. Configure `jwt_token` in collection environment variables.
4. Execute requests against `http://localhost:8084`.
