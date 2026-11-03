# Personal Finance Tracker - Implementation Checklist

Based on PROJECT 1 weeks 1 & 2 requirements

## ✅ COMPLETED

### Frontend
- Set up React, TypeScript, Tailwind CSS ✅
- Application layout with Sidebar ✅
- Build login and registration pages (AuthContext only, no separate UI pages) ⚠️
- Create dashboard screen (Overview.tsx) ✅
- Build transaction management UI (Transactions.tsx) ✅
- Build transaction forms (AddTransactionForm.tsx) ✅
- Category selection and filters ✅
- Add responsive layouts ✅
- Form validation (React Hook Form) (not using React Hook Form, using native validation) ⚠️
- Integrate frontend with API Gateway ✅
- Build budget creation and editing screens (Budgets.tsx) ✅
- Display budget usage and remaining amounts ✅
- Build debt management screen (Debts.tsx) ✅
- Display outstanding balances and due dates ✅
- Display repayment progress ✅
- Integrate dashboard summaries from backend services ✅
- Add loading, empty, success, and error states ✅
- Finish responsive UI ✅
- Basic accessibility checks ⚠️

### Backend Services
- Set up Java 21, Spring Boot, Maven
- Establish monorepo structure (frontend/, services/, infrastructure/)
- Configure Docker and Docker Compose for local development
- Implement Authentication and User Service
  - User registration, login, logout
  - JWT token generation and validation
  - User profile management
- Implement API Gateway with Spring Cloud Gateway
  - Centralized routing to all services
  - JWT validation filter
  - User context propagation (X-User-Id header)
  - CORS configuration
- Build Transaction Service
  - CRUD endpoints for transactions
  - Income and expense tracking
  - Category filtering
  - Date filtering
  - Summary calculations (income, expenses, net cash flow)
  - Category entity, table, CRUD operations, and seeding
- Build Budget Service
  - CRUD operations
  - Budget spending calculations from actual transaction data
  - Month-boundary filtering
- Build Debt Management Service
  - CRUD operations
  - Debt payment recording
  - Payment history
  - Updated debt balances
  - Basic payoff estimates
- Build Dashboard and Reporting Service
  - Real-time dashboard data aggregation from all services
  - WebClient communication with other services
- Configure REST communication between services (WebClient)
- Service timeout configuration (10 second timeouts)
- Validate financial inputs
- Verify database relationships
- Transaction consistency (debt payments update balances)
- Data isolation (user ownership checks)
- User-level authorization enforcement
- Monetary precision (BigDecimal, NUMERIC columns)
- Payment consistency
- Advanced error handling in WebClient
- Event-driven communication (Kafka for transactions and debt payments)
- Structured logging (JSON with logback-logback-encoder)
- Request correlation (Correlation ID filters)
- Health-check endpoints (Spring Boot Actuator)

### Database
- Database migrations with Flyway
  - User profiles table
  - Transactions table
  - Budgets table
  - Debts and debt payments tables
  - Category table with foreign key relationships
  - Foreign key constraints for cross-service references
- Use BigDecimal for monetary calculations
- Use UUID for resource identifiers
- Enforce user ownership in every service
- Add input validation and user-level authorization
- Configure standard API error responses

### Testing
- Backend unit tests (JUnit 5, Mockito)
  - Auth Service tests (service) ✅
  - Transaction Service tests (service) ✅
  - Budget Service tests (service) ✅
  - Debt Service tests (service) ✅
  - Dashboard Service tests (service) ✅
  - Budgets, debt payments, payoff calculations ✅
  - Financial calculations ✅
  - Payment validation and balance consistency ✅
- Integration tests with Testcontainers
  - Transaction Service integration tests (CRUD, user isolation) ✅
  - Budget Service integration tests (CRUD, month filtering) ✅
  - Debt Service integration tests (CRUD, payments, progress) ✅
- API integration tests for budgets, debts, authorization ✅
- Test invalid inputs, missing resources ✅
- Test cross-user data access (SecurityException) ✅
- Test authentication enforcement ✅
- Frontend unit tests (Vitest, React Testing Library)
  - Basic App test ✅
- Frontend end-to-end tests (Playwright)
  - Authentication flow (register, login, logout) ✅
  - Transaction flow (add, delete, filter) ✅
  - Budget flow (add, update, delete) ✅
  - Debt flow (add, update, delete, payments) ✅
- Test coverage configuration (Vitest coverage v8) ✅

### DevOps & CI/CD
- Configure GitHub repository
- Frontend linting and TypeScript checks
- Java compilation setup
- GitHub Actions CI workflow
  - Install frontend dependencies
  - Compile all Spring Boot services
  - Run frontend linting and type checks
  - Run backend unit and integration tests
  - Run frontend tests
  - Build frontend and backend services
  - Run dependency vulnerability checks (Trivy)
- CD Pipeline
  - Deploy successful main-branch builds
  - Publish versioned container images to Docker Hub
  - Run service health checks and smoke tests
  - Verify service connectivity
  - Report deployment status
- Dockerfiles for all services
- Docker Compose configuration with health checks
- Production health checks configured
- Smoke tests in CD pipeline

---

## ⚠️ PARTIALLY IMPLEMENTED

### Authentication
- JWT implementation in Auth Service (completed)
- JWT validation in API Gateway (completed)
- User context propagation (completed)
- OAuth 2.0 / OIDC external identity provider integration (not implemented)
- Token refresh mechanism (not implemented)
- Password reset functionality (not implemented)

### Dashboard Service
- Service created with WebClient configuration (completed)
- Routes to other services (completed)
- Returns real aggregated data from transactions, budgets, and debts (completed)
- Dashboard snapshots (not implemented)
- Real-time updates (not implemented)

### Debt Progress
- Calculated in service (completed)
- Integrated with payment history (completed)
- Payoff timeline (basic implementation only, no interest accrual)
- Interest accrual (not implemented)

### Service Communication
- WebClient configured (completed)
- Basic REST calls implemented (completed)
- Timeout configuration (10 second timeouts, completed)
- Retry logic (not implemented)
- Circuit breakers (not implemented)
- Fallback mechanisms (not implemented)

### CI/CD
- GitHub Actions CI pipeline created and updated:
  - Frontend lint/type check configured
  - Frontend unit tests with coverage configured
  - Backend unit tests separated from integration tests
  - Backend integration tests with Testcontainers configured
  - E2E tests with Playwright configured
  - Test reports uploaded as artifacts
  - GitHub Actions deprecation warnings (Node.js 20, setup-java v4, CodeQL v3)
- CD Pipeline created but needs testing after CI validation:
  - Docker image build and push configured
  - Staging deployment via SSH configured
  - Smoke tests configured
- Additional requirements:
  - Apply backward-compatible database migrations
  - Production environment configuration
  - Actual cloud deployment
  - Monitoring setup

---

## TODO

### Backend Features
- Implement OAuth 2.0 / OIDC external identity provider integration
- Add token refresh mechanism
- Add password reset functionality
- Implement advanced debt payoff estimates with interest accrual
- Add retry logic for service communication
- Add circuit breakers for service communication
- Add fallback mechanisms for service communication
- Implement dashboard snapshots (optional, for reporting)
- Add database transaction tests for debt payments

### Security
- Configure rate limiting
- Configure request size limits
- Configure IP allowlisting
- Configure OWASP security headers
- Add SQL injection protection testing

### Testing
- Add API Gateway integration tests
- Add monetary precision edge case tests
- Add date filtering edge case tests
- Add large dataset performance tests
- Test service timeouts and downstream failures
- Test dependency vulnerability checks

### CI/CD & Cloud
- Apply backward-compatible database migrations in CD pipeline
- Production environment configuration
  - Environment variables and secrets
  - Production CORS configuration
  - Authentication rate limits
  - Request rate limits
- Cloud hosting deployment
  - AWS ECS Fargate or alternative
  - Amazon RDS for PostgreSQL
  - HTTPS configuration
  - SSL/TLS certificates
- Database backups
  - Automated backups
  - Backup retention settings
  - Restoration procedures
- Application logs and monitoring
  - CloudWatch or alternative
  - Log aggregation
  - Error tracking
  - Uptime monitoring
- Documentation
  - Setup documentation
  - Deployment documentation
  - Rollback procedures
  - Backup restoration procedures
  - Troubleshooting guide
- Configure and verify API documentation (Springdoc/OpenAPI)

### Future Scope (Not Required for MVP)
- Spending and debt charts (partially in frontend)
- CSV export/import
- Recurring transactions
- Email payment reminders
- Distributed tracing
- Advanced observability
- Chaos engineering
- Bank integrations
- Automated transaction imports
