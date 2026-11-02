# Implementation Issues and Solutions

## Session Date: November 1, 2026

## Backend Implementation Issues

### 1. Category Entity Implementation
**Issue**: Categories were stored as strings in transactions, limiting categorization capabilities.

**Solution**:
- Created `Category` entity with JPA annotations
- Added foreign key relationship from `transactions` to `categories`
- Created `CategoryRepository` with custom queries
- Implemented `CategoryService` with full CRUD operations
- Added `CategoryController` with REST endpoints
- Created database migrations:
  - V2__Create_categories_table.sql
  - V3__Add_category_fk_to_transactions.sql
  - V4__Seed_default_categories.sql
- Updated `Transaction` model to include both `category` (ManyToOne) and `categoryName` (String) fields
- Added `@PrePersist` and `@PreUpdate` lifecycle callbacks to sync category name
- Modified `TransactionService` to auto-create categories if they don't exist

### 2. Budget Spending Calculations
**Issue**: Budget service returned hardcoded 0 for spent amounts instead of calculating from actual transactions.

**Solution**:
- Added `spring-boot-starter-webflux` dependency to budget-service
- Created `WebClientConfig` with WebClient bean for transaction service communication
- Implemented `TransactionClient` interface using Spring's HTTP service proxy
- Created `ClientConfig` to configure HTTP service proxy factory
- Added `WebClientUserContextFilter` to propagate user context in service-to-service calls
- Updated `BudgetService.calculateSpent()` to:
  - Fetch transactions from transaction service via WebClient
  - Filter by category, type (EXPENSE), and date range (month/year)
  - Sum amounts to calculate spent amount
- Updated `BudgetController` to return `BudgetResponse` with spent/remaining amounts
- Created DTOs: `TransactionSummaryResponse` and `BudgetResponse`

### 3. Dashboard Data Aggregation
**Issue**: Dashboard service returned stubbed data (BigDecimal.valueOf(0)) instead of real aggregations.

**Solution**:
- Created DTOs: `DebtSummary` and `BudgetSummary` to match service response structures
- Updated `DashboardService.fetchDebtSummary()` to:
  - Parse actual debt balances from `DebtSummary` objects
  - Sum all current balances for total outstanding debt
- Updated `DashboardService.fetchBudgetSummary()` to:
  - Parse budget data from `BudgetSummary` objects
  - Calculate total spent and total limit
  - Compute budget utilization percentage (spent/limit)
- Modified `DashboardService.getDashboardSummary()` to use real aggregations

### 4. Structured Logging
**Issue**: No centralized or structured logging across services, making debugging difficult.

**Solution**:
- Added `logstash-logback-encoder` dependency (version 7.4) to all services
- Created `logback-spring.xml` configuration files for all services:
  - auth-service
  - transaction-service
  - budget-service
  - debt-service
  - dashboard-service
  - gateway
- Configured JSON log format with:
  - Console appender with LogstashEncoder
  - File appender with 30-day log rotation
  - Service name in custom fields
  - MDC support for context
- Added `CorrelationIdFilter` to all services for request tracking:
  - Generates UUID correlation ID if not present in headers
  - Adds correlation ID to MDC for all log entries
  - Ensures correlation ID propagation across services

### 5. WebClient Timeouts and Error Handling
**Issue**: No timeout configuration or error handling for service-to-service communication.

**Solution**:
- Created `WebClientConfig` in budget-service with:
  - HttpClient with 10-second response timeout
  - Read and write timeout handlers (10 seconds each)
  - Error handling for 4xx and 5xx responses
  - Log error details when service calls fail
- Updated `WebClientConfig` in dashboard-service with:
  - Same timeout configuration
  - User context propagation filter
  - Centralized error handling
  - Shared configuration method for all WebClients

### 6. Kafka Event-Driven Communication
**Issue**: No event-driven architecture for service decoupling and real-time updates.

**Solution**:
- Added Apache Kafka to docker-compose.yml:
  - Zookeeper service (port 2181)
  - Kafka service (ports 9092, 9093)
  - Health checks for Kafka
- Added `spring-kafka` dependency to services:
  - transaction-service (producer)
  - budget-service (consumer)
  - dashboard-service (consumer)
  - debt-service (producer)
- Created Kafka configurations:
  - `KafkaConfig` in transaction-service (producer)
  - `KafkaConfig` in budget-service (consumer)
  - `KafkaConfig` in dashboard-service (consumer)
  - `KafkaConfig` in debt-service (producer)
- Created event classes:
  - `TransactionEvent` (transaction-service, budget-service, dashboard-service)
  - `DebtPaymentEvent` (debt-service)
- Created event producers:
  - `TransactionEventProducer` in transaction-service
  - `DebtPaymentEventProducer` in debt-service
- Created event consumers:
  - `TransactionEventConsumer` in budget-service (invalidates budget cache)
  - `TransactionEventConsumer` in dashboard-service (invalidates dashboard cache)
- Updated services to publish events:
  - `TransactionService.createTransaction()` publishes CREATED event
  - `DebtService.createPayment()` publishes CREATED event
- Configured Kafka bootstrap servers in application.properties

## DevOps Implementation Issues

### 7. GitHub Actions CI Pipeline
**Issue**: No CI/CD pipeline for automated testing and building.

**Solution**:
- Created `.github/workflows/ci.yml` with comprehensive CI pipeline:
  - Frontend lint and type check job
  - Frontend tests job
  - Frontend dependency audit job
  - Backend compilation job (all services)
  - Backend unit tests job (all services)
  - Backend integration tests job (with PostgreSQL service)
  - Backend build job
  - Frontend build job
  - Security scanning job (Trivy)
  - CI summary job
- Configured job dependencies and artifacts
- Added PostgreSQL service for integration tests
- Implemented security scanning with SARIF upload

### 8. Dockerfiles for All Services
**Issue**: No containerization strategy for deployment.

**Solution**:
- Created multi-stage Dockerfiles for all services:
  - `frontend/Dockerfile` (Node.js build + nginx runtime)
  - `services/auth-service/Dockerfile` (Maven build + JRE runtime)
  - `services/transaction-service/Dockerfile` (Maven build + JRE runtime)
  - `services/budget-service/Dockerfile` (Maven build + JRE runtime)
  - `services/debt-service/Dockerfile` (Maven build + JRE runtime)
  - `services/dashboard-service/Dockerfile` (Maven build + JRE runtime)
  - `infrastructure/gateway/Dockerfile` (Maven build + JRE runtime)
- Created `frontend/nginx.conf` for nginx configuration
- Added `.dockerignore` to exclude unnecessary files
- Created root-level `docker-compose.yml` with:
  - All services with health checks
  - Service dependencies
  - Networking configuration
  - Volume for PostgreSQL
  - Kafka and Zookeeper services

### 9. GitHub Actions CD Pipeline
**Issue**: No automated deployment pipeline.

**Solution**:
- Created `.github/workflows/cd.yml` with:
  - Build and push Docker images to Docker Hub
  - Deploy to staging server via SSH
  - Run smoke tests after deployment
  - Deployment status notifications
- Configured Docker Hub authentication
- Implemented multi-arch image building with Buildx
- Added image tagging strategy (branch, SHA, latest)

## Pending Issues (Not Yet Resolved)

### 10. CI Pipeline Failures
**Current Status**: CI pipeline is failing on multiple jobs

**Issues Identified**:
1. **Frontend Lint & Type Check**: Exit code 2
   - Likely missing ESLint or TypeScript configuration
   - May need to add lint scripts to package.json

2. **Frontend Tests**: Exit code 1
   - Test configuration may be missing
   - No coverage directory found

3. **Frontend Dependency Audit**: Exit code 1
   - Vulnerabilities found or audit configuration issue

4. **Backend Compilation**: Exit code 1
   - Compilation errors in services
   - May be related to new Kafka dependencies

5. **Backend Unit Tests**: Exit code 1
   - Test failures or missing test classes
   - No surefire-reports found

6. **Backend Integration Tests**: Exit code 1
   - Integration test failures
   - Database connection issues

7. **Security Scanning**: Path does not exist error
   - Trivy SARIF file not generated
   - Permission issues with CodeQL API

8. **GitHub Actions Deprecation Warnings**:
   - Node.js 20 deprecated (being forced to run on Node.js 24)
   - setup-java v4 deprecated (should migrate to v5)
   - CodeQL Action v3 deprecated (should migrate to v4)

**Proposed Solutions**:
1. Fix frontend package.json scripts:
   - Add `"lint": "eslint src --ext .ts,.tsx"`
   - Add `"type-check": "tsc --noEmit"`
   - Ensure test scripts are properly configured

2. Fix backend compilation:
   - Verify all new dependencies are correctly added
   - Check for any circular dependencies
   - Ensure Kafka configurations are valid

3. Fix test configurations:
   - Ensure test directories exist
   - Verify test class naming conventions
   - Check test resource configurations

4. Update GitHub Actions:
   - Migrate from `actions/setup-java@v4` to `actions/setup-java@v5`
   - Update CodeQL Action from v3 to v4
   - Add security-events permission to workflow
   - Configure Trivy to properly generate SARIF output

5. Fix security scanning:
   - Add `trivy` to PATH or use GitHub Action version
   - Ensure SARIF output path is correct
   - Add required permissions for security events

### 11. Missing Integration Tests
**Current Status**: Only Transaction Service has integration tests

**Solution Needed**:
- Add integration tests for Budget Service with Testcontainers
- Add integration tests for Debt Service with Testcontainers
- Add integration tests for Auth Service with Testcontainers
- Add integration tests for Dashboard Service
- Add integration tests for API Gateway

### 12. Month-Boundary Filtering
**Current Status**: Partially implemented in budget calculations

**Solution Needed**:
- Add explicit month-boundary filtering methods
- Test edge cases (month start/end dates)
- Handle year transitions correctly

### 13. Debt Payoff Estimates
**Current Status**: Basic implementation without interest accrual

**Solution Needed**:
- Implement interest accrual calculations
- Calculate payoff timeline based on minimum payments
- Add accelerated payoff scenarios

### 14. API Documentation
**Current Status**: Springdoc added but not verified/accessible

**Solution Needed**:
- Verify Swagger UI is accessible at /swagger-ui.html
- Configure API documentation properly
- Add API descriptions and examples

## Architectural Decisions Made

1. **Category Management**: Used both Category entity and categoryName string for flexibility and performance
2. **Event-Driven**: Chose Kafka over message queues for event streaming capabilities
3. **Logging**: Used JSON logging with correlation IDs for distributed tracing
4. **Service Communication**: Used WebClient with Spring HTTP service proxy for type-safe calls
5. **Containerization**: Used multi-stage Docker builds for smaller image sizes
6. **CI/CD**: Separated CI and CD pipelines for flexibility
7. **Database**: Continued using PostgreSQL with Flyway migrations
8. **Timeouts**: Configured 10-second timeouts for all service calls
9. **Error Handling**: Added basic error handling without circuit breakers (to be added later)
10. **Correlation IDs**: Implemented request correlation across all services

## Lessons Learned

1. Always verify new dependencies compile before committing
2. Test CI pipeline configuration locally if possible
3. Ensure all required GitHub Actions permissions are set
4. Keep GitHub Actions dependencies up to date
5. Document environment variables and secrets needed
6. Use feature flags for rolling out new features
7. Add health checks to all services early
8. Implement logging and monitoring from the start
9. Test service-to-service communication thoroughly
10. Plan for database migrations in production

## Next Steps

1. Fix CI pipeline failures
2. Add missing integration tests
3. Implement remaining backend features
4. Add circuit breakers and retry logic
5. Configure production monitoring
6. Add API documentation
7. Deploy to staging environment
8. Perform end-to-end testing
9. Set up production environment
10. Create deployment documentation
