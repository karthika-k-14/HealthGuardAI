# HealthGuard AI - Admin Service (`admin-service`)

Production-ready microservice built with **Java 21** and **Spring Boot 3.5.2** for administrative operations, health officer management, pharmacist registration, pharmacy inventory tracking, digital prescription fulfillment, and analytical reporting across the HealthGuard AI ecosystem.

---

## 🚀 Overview

The `admin-service` microservice provides high-level governance, health system administration, inventory and stock monitoring, and operational reporting. It enforces **Spring Security 6** with **Role-Based Access Control (RBAC)** (`ROLE_ADMIN`, `ROLE_HEALTH_OFFICER`, `ROLE_PHARMACIST`) validating JWT tokens issued by `auth-service`.

---

## 🛠️ Technologies Used

- **Java Version:** 21
- **Spring Boot Version:** 3.5.2
- **Build Tool:** Maven (Wrapper included)
- **Database:** PostgreSQL (`healthguard_admin_db`)
- **Security:** Spring Security 6, JJWT 0.12.6 (Stateless JWT + RBAC)
- **Validation:** Jakarta Bean Validation
- **Utilities:** Lombok, Spring Boot DevTools, Spring Boot Actuator

---

## 📁 Folder Structure

```text
backend/admin-service/
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── postman/
│   └── Admin_Service.postman_collection.json
├── src/
│   ├── main/
│   │   ├── java/com/healthguard/admin/
│   │   │   ├── AdminServiceApplication.java
│   │   │   ├── admin/
│   │   │   │   ├── controller/AdminController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── AdminResponse.java
│   │   │   │   │   ├── DashboardSummaryResponse.java
│   │   │   │   │   └── UserSummaryResponse.java
│   │   │   │   ├── entity/Admin.java
│   │   │   │   ├── repository/AdminRepository.java
│   │   │   │   └── service/
│   │   │   │       ├── AdminService.java
│   │   │   │       └── impl/AdminServiceImpl.java
│   │   │   ├── analytics/
│   │   │   │   ├── controller/AnalyticsController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── AnalyticsDashboardResponse.java
│   │   │   │   │   ├── AnalyticsReportResponse.java
│   │   │   │   │   └── StockReportResponse.java
│   │   │   │   └── service/
│   │   │   │       ├── AnalyticsService.java
│   │   │   │       └── impl/AnalyticsServiceImpl.java
│   │   │   ├── config/
│   │   │   ├── exception/
│   │   │   │   ├── DuplicateResourceException.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── healthofficer/
│   │   │   │   ├── controller/HealthOfficerController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── HealthOfficerRequest.java
│   │   │   │   │   ├── HealthOfficerResponse.java
│   │   │   │   │   └── UpdateHealthOfficerRequest.java
│   │   │   │   ├── entity/HealthOfficer.java
│   │   │   │   ├── repository/HealthOfficerRepository.java
│   │   │   │   └── service/
│   │   │   │       ├── HealthOfficerService.java
│   │   │   │       └── impl/HealthOfficerServiceImpl.java
│   │   │   ├── medicine/
│   │   │   │   ├── controller/MedicineController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── MedicineRequest.java
│   │   │   │   │   ├── MedicineResponse.java
│   │   │   │   │   └── UpdateMedicineRequest.java
│   │   │   │   ├── entity/Medicine.java
│   │   │   │   ├── repository/MedicineRepository.java
│   │   │   │   └── service/
│   │   │   │       ├── MedicineService.java
│   │   │   │       └── impl/MedicineServiceImpl.java
│   │   │   ├── pharmacist/
│   │   │   │   ├── controller/PharmacistController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── PharmacistRequest.java
│   │   │   │   │   ├── PharmacistResponse.java
│   │   │   │   │   └── UpdatePharmacistRequest.java
│   │   │   │   ├── entity/Pharmacist.java
│   │   │   │   ├── repository/PharmacistRepository.java
│   │   │   │   └── service/
│   │   │   │       ├── PharmacistService.java
│   │   │   │       └── impl/PharmacistServiceImpl.java
│   │   │   ├── prescription/
│   │   │   │   ├── controller/PrescriptionController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── PrescriptionRequest.java
│   │   │   │   │   ├── PrescriptionResponse.java
│   │   │   │   │   └── UpdatePrescriptionRequest.java
│   │   │   │   ├── entity/Prescription.java
│   │   │   │   ├── repository/PrescriptionRepository.java
│   │   │   │   └── service/
│   │   │   │       ├── PrescriptionService.java
│   │   │   │       └── impl/PrescriptionServiceImpl.java
│   │   │   ├── security/
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── SecurityConfig.java
│   │   │   └── util/
│   │   │       └── ApiResponse.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       ├── java/com/healthguard/admin/
│       │   └── AdminServiceApplicationTests.java
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
2. Create database `healthguard_admin_db`:
   ```sql
   CREATE DATABASE healthguard_admin_db;
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
*The service will start on port `8085`.*

---

## 📡 API Documentation

### Admin APIs (`/api/admin`)
- `GET /api/admin/dashboard` - Get high-level system dashboard metrics
- `GET /api/admin/users` - Get unified list of system users

### Health Officer APIs (`/api/health-officers`)
- `POST /api/health-officers` - Register a new Health Officer
- `GET /api/health-officers` - List all Health Officers
- `GET /api/health-officers/{id}` - Get Health Officer by ID
- `PUT /api/health-officers/{id}` - Update Health Officer details
- `DELETE /api/health-officers/{id}` - Delete Health Officer

### Pharmacist APIs (`/api/pharmacists`)
- `POST /api/pharmacists` - Register a new Pharmacist
- `GET /api/pharmacists` - List all Pharmacists
- `GET /api/pharmacists/{id}` - Get Pharmacist by ID
- `PUT /api/pharmacists/{id}` - Update Pharmacist details
- `DELETE /api/pharmacists/{id}` - Delete Pharmacist

### Medicine APIs (`/api/medicines`)
- `POST /api/medicines` - Add medicine to inventory
- `GET /api/medicines` - List all medicines in stock
- `GET /api/medicines/{id}` - Get medicine by ID
- `PUT /api/medicines/{id}` - Update medicine stock/price/details
- `DELETE /api/medicines/{id}` - Delete medicine record

### Prescription APIs (`/api/prescriptions`)
- `POST /api/prescriptions` - Create citizen prescription
- `GET /api/prescriptions` - List all prescriptions
- `GET /api/prescriptions/{id}` - Get prescription by ID
- `PUT /api/prescriptions/{id}` - Update prescription status/details
- `DELETE /api/prescriptions/{id}` - Delete prescription record

### Analytics APIs (`/api/analytics`)
- `GET /api/analytics/dashboard` - Retrieve system analytical metrics
- `GET /api/analytics/medicine-stock` - Get medicine inventory stock report
- `GET /api/analytics/reports` - Generate comprehensive system analytics report

---

## 🧪 Postman Testing

1. Open Postman.
2. Import `postman/Admin_Service.postman_collection.json`.
3. Configure `jwt_token` in collection environment variables.
4. Execute requests against `http://localhost:8085`.
