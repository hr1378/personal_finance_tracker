# Testing Guide

This document provides an overview of the testing strategy and execution for the Personal Finance Tracker application.

## Testing Overview

The project uses a comprehensive testing strategy with three levels of testing:

1. **Unit Tests** - Test individual components, services, and functions in isolation
2. **Integration Tests** - Test service interactions with real databases using Testcontainers
3. **End-to-End (E2E) Tests** - Test complete user flows using Playwright

## Backend Testing

### Unit Tests

Backend unit tests use JUnit 5 and Mockito for mocking dependencies.

**Location**: `services/*/src/test/java/com/finance/*/`

**Coverage**:
- Controllers: Request/response handling, validation, error scenarios
- Services: Business logic, security checks, data transformations
- Filters: Request/response processing, user context propagation
- Utilities: JWT token generation/validation, password encoding

**Running Unit Tests**:
```bash
cd services/<service-name>
mvn test
```

**Run specific test class**:
```bash
mvn test -Dtest=AuthServiceTest
```

**Run unit tests only (exclude integration)**:
```bash
mvn test -Dtest='!*IntegrationTest'
```

### Integration Tests

Backend integration tests use Testcontainers to spin up real PostgreSQL databases for testing.

**Location**: `services/*/src/test/java/com/finance/*/integration/`

**Coverage**:
- Database operations (CRUD)
- Flyway migrations
- Service interactions with repositories
- Transaction management
- User context and security

**Running Integration Tests**:
```bash
cd services/<service-name>
mvn test -Dtest=*IntegrationTest
```

**Note**: Integration tests require Docker to be running locally or in CI.

### Test Services

1. **Auth Service**
   - `AuthServiceTest` - Registration, login, user retrieval
   - `AuthControllerTest` - API endpoints, validation
   - `JwtUtilTest` - Token generation and validation
   - `AuthServiceIntegrationTest` - Full flow with database

2. **Transaction Service**
   - `TransactionServiceTest` - CRUD operations, security checks
   - `TransactionControllerTest` - API endpoints
   - `UserContextFilterTest` - User context propagation
   - `TransactionServiceIntegrationTest` - Database operations

3. **Budget Service**
   - `BudgetServiceTest` - Budget management
   - `BudgetControllerTest` - API endpoints
   - `BudgetServiceIntegrationTest` - Database operations

4. **Debt Service**
   - `DebtServiceTest` - Debt and payment management
   - `DebtControllerTest` - API endpoints
   - `DebtServiceIntegrationTest` - Database operations

5. **Dashboard Service**
   - `DashboardServiceTest` - Summary calculations
   - `DashboardServiceIntegrationTest` - Integration with other services

6. **Accounts Service**
   - `AccountServiceTest` - Account CRUD, ownership checks, card unlinking on delete
   - `CardServiceTest` - Card CRUD, account association, ownership checks
   - `AccountControllerTest` / `CardControllerTest` - API endpoints, validation
   - `AccountsServiceIntegrationTest` - Database operations with Testcontainers + Flyway

6. **API Gateway**
   - `JwtAuthenticationFilterTest` - JWT validation and routing

## Frontend Testing

### Unit Tests

Frontend unit tests use Vitest with React Testing Library.

**Location**: `frontend/src/**/*.test.ts` and `frontend/src/**/*.test.tsx`

**Coverage**:
- Components: Rendering, user interactions, state changes
- API Client: HTTP requests, error handling, data transformation
- State Management: Store actions, state updates, error handling

**Running Unit Tests**:
```bash
cd frontend
npm test
```

**Run with coverage**:
```bash
npm test -- --coverage
```

**Run in watch mode**:
```bash
npm test -- --watch
```

**Run with UI**:
```bash
npm test -- --ui
```

### Test Components

1. **AddTransactionForm.test.tsx** - Form validation, submission, reset, account/card selectors
2. **Sidebar.test.tsx** - Navigation, view switching, counts display
3. **api.test.ts** - API client methods, error handling, data transformation
4. **Accounts.test.tsx** - Accounts screen rendering, account/card CRUD interactions
5. **App.test.tsx** - App rendering and auth gating
6. **useFinanceStore.test.ts** - State management, actions, error handling
7. **ChatWidget.test.tsx** - Chat panel open/close, permission toggle, message send, error state

### End-to-End Tests

E2E tests use Playwright to test complete user flows in a real browser.

**Location**: `frontend/tests/e2e/`

**Coverage**:
- Authentication flow (register, login, logout)
- Transaction management (add, delete, filter, account/card linking)
- Accounts & cards management (add, edit, delete accounts and cards)
- Budget management (add, update, delete)
- Debt management (add, update, delete, payments)

**Running E2E Tests**:
```bash
cd frontend
npm run test:e2e
```

**Run with UI**:
```bash
npm run test:e2e:ui
```

**Run on specific browser**:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Run specific test file**:
```bash
npx playwright test auth-flow.spec.ts
```

**Debug mode**:
```bash
npx playwright test --debug
```

### E2E Test Flows

1. **auth-flow.spec.ts**
   - User registration
   - User login with valid credentials
   - Login failure with invalid credentials
   - User logout

2. **transaction-flow.spec.ts**
   - Add new transaction
   - Filter transactions by type
   - Delete transaction
   - View transaction summary

3. **budget-flow.spec.ts**
   - Add new budget
   - Update existing budget
   - Delete budget
   - View budget utilization

4. **debt-flow.spec.ts**
   - Add new debt
   - Record debt payment
   - Update existing debt
   - Delete debt
   - View debt progress

5. **accounts-flow.spec.ts**
   - Add new bank account
   - Add new card
   - Link a transaction to an account/card
   - Delete an account

## CI/CD Integration

### GitHub Actions CI Pipeline

The CI pipeline runs all tests on every push and pull request:

1. **Frontend Checks**
   - TypeScript type checking
   - ESLint linting
   - Unit tests with coverage
   - Production build

2. **Backend Checks** (run in parallel for each service)
   - Unit tests (excluding integration tests)
   - Production build

3. **Backend Integration Tests** (run after backend checks)
   - Integration tests with Testcontainers
   - Upload test reports as artifacts

4. **E2E Tests** (run after frontend and backend checks)
   - Playwright E2E tests
   - Upload test reports as artifacts

### Test Reports

Test reports are uploaded as GitHub Actions artifacts with 7-day retention:

- `<service>-test-reports` - Unit test reports
- `<service>-integration-test-reports` - Integration test reports
- `playwright-report` - E2E test HTML report

## Local Development

### Prerequisites

- Docker and Docker Compose (for integration tests)
- Node.js 20+ (for frontend tests)
- Java 21 (for backend tests)
- Maven (for backend tests)

### Running All Tests Locally

```bash
# Backend unit tests
cd services/auth-service && mvn test
cd services/transaction-service && mvn test
cd services/budget-service && mvn test
cd services/debt-service && mvn test
cd services/dashboard-service && mvn test
cd services/accounts-service && mvn test

# Backend integration tests (requires Docker)
cd services/auth-service && mvn test -Dtest=*IntegrationTest
cd services/transaction-service && mvn test -Dtest=*IntegrationTest
cd services/budget-service && mvn test -Dtest=*IntegrationTest
cd services/debt-service && mvn test -Dtest=*IntegrationTest
cd services/dashboard-service && mvn test -Dtest=*IntegrationTest
cd services/accounts-service && mvn test -Dtest=*IntegrationTest

# Frontend unit tests
cd frontend && npm test

# Frontend E2E tests (requires running application)
cd frontend && npm run test:e2e
```

### Test Coverage Goals

- **Backend Unit Tests**: >80% coverage
- **Backend Integration Tests**: Critical paths covered
- **Frontend Unit Tests**: >70% coverage
- **E2E Tests**: All major user flows covered

## Monitoring Verification

The stack includes Prometheus, Grafana, Elasticsearch, Kibana, and Filebeat.

**Verify metrics pipeline**:
```bash
# All scrape targets should show up=1
curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool | grep -c '"health": "up"'

# Prometheus endpoint exposed by each service
curl -s http://localhost:8086/actuator/prometheus | head -5
```

**Verify log pipeline**:
```bash
# Elasticsearch should have a finance-logs-* index with documents
curl -s 'http://localhost:9200/_cat/indices?v' | grep finance-logs
curl -s 'http://localhost:9200/finance-logs-*/_count'
```

**UIs**: Grafana at http://localhost:3001 (admin / `GRAFANA_ADMIN_PASSWORD`, default `admin`),
Kibana at http://localhost:5601, Prometheus at http://localhost:9090.

## Best Practices

### Backend Testing

1. **Mock external dependencies** - Use Mockito for repositories, external services
2. **Test security** - Verify user ownership checks, authorization
3. **Test edge cases** - Null values, empty lists, invalid inputs
4. **Use descriptive test names** - Follow `should_When_Then` pattern
5. **Keep tests independent** - Each test should run in isolation

### Frontend Testing

1. **Test user behavior, not implementation** - Focus on what users see and do
2. **Use testing-library queries** - Prefer accessible queries over CSS selectors
3. **Mock API calls** - Use vi.mock for API client
4. **Test error states** - Verify error handling and loading states
5. **Keep tests focused** - One assertion per test when possible

### E2E Testing

1. **Test critical paths** - Focus on happy paths and common error scenarios
2. **Use page objects** - Reusable page models for common actions
3. **Wait for elements** - Use proper waiting strategies instead of sleep
4. **Clean up test data** - Delete created test data after each test
5. **Run in headless mode in CI** - Use headed mode only for debugging

## Troubleshooting

### Backend Integration Tests Fail

If integration tests fail locally:
1. Ensure Docker is running: `docker ps`
2. Check Testcontainers logs for database startup issues
3. Verify PostgreSQL container can be pulled: `docker pull postgres:16`
4. On Docker Desktop for Mac, Testcontainers may fail to detect Docker or
   negotiate the API version. Workaround:
   ```bash
   DOCKER_HOST=unix://$HOME/.docker/run/docker.sock mvn test -Dtest=*IntegrationTest -Dapi.version=1.44
   ```

### Frontend Tests Fail

If frontend tests fail:
1. Clear cache: `rm -rf node_modules && npm install`
2. Check Vitest configuration in `vitest.config.ts`
3. Verify test setup file `src/test/setup.ts`

### E2E Tests Fail

If E2E tests fail:
1. Ensure the application is running on the expected port
2. Check Playwright browser installation: `npx playwright install`
3. Run with headed mode to see what's happening: `npx playwright test --headed`
4. Check network requests in Playwright trace viewer

## Continuous Improvement

- Add tests for new features before implementation (TDD)
- Update tests when fixing bugs to prevent regressions
- Review test coverage regularly and add tests for uncovered code
- Refactor tests to maintain readability and reduce duplication
- Keep test execution time reasonable for fast feedback
