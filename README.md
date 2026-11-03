# Personal Finance Tracker

A microservices-based personal finance and debt tracking application with authentication, transaction management, budget tracking, and debt monitoring.

## Architecture

The application consists of:
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Java 21, Spring Boot microservices
- **API Gateway**: Spring Cloud Gateway with JWT authentication
- **Database**: PostgreSQL with Flyway migrations
- **Services**:
  - Auth Service (port 8081)
  - Transaction Service (port 8082)
  - Budget Service (port 8083)
  - Debt Service (port 8084)
  - Dashboard Service (port 8085)
  - API Gateway (port 8080)

## Security Features

### Authentication & Authorization
- JWT-based authentication
- JWT validation at API Gateway
- User context propagation to downstream services via `X-User-Id` header
- User ownership checks in all services
- Protection against cross-user data access
- Unauthorized request handling

### Health Monitoring
- Spring Boot Actuator endpoints on all services
- Health checks at `/actuator/health`
- Metrics at `/actuator/metrics`
- Info at `/actuator/info`

## Local Development

### Prerequisites
- Docker and Docker Compose
- Java 21
- Node.js 20+
- Maven

### Option 1: Full Docker Setup (Production-like)

```bash
# Start all services including frontend
docker-compose up -d

# Access the application at http://localhost:3000
```

### Option 2: Development Mode (Recommended)

```bash
# Start backend services only
docker-compose -f docker-compose.dev.yml up -d

# Start frontend dev server
cd frontend
npm install
npm run dev

# Access the application at http://localhost:5173
```

### Option 3: Local Backend Development

```bash
# Start only infrastructure (PostgreSQL, Kafka)
docker-compose -f docker-compose.dev.yml up -d postgres kafka zookeeper

# Start each service locally
cd services/auth-service && mvn spring-boot:run
cd services/transaction-service && mvn spring-boot:run
cd services/budget-service && mvn spring-boot:run
cd services/debt-service && mvn spring-boot:run
cd services/dashboard-service && mvn spring-boot:run
cd infrastructure/gateway && mvn spring-boot:run

# Start frontend
cd frontend
npm run dev
```

### API Endpoints

#### Auth Service
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

#### Transaction Service (requires JWT)
- `GET /api/transactions` - Get all transactions (user's own)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/{id}` - Get transaction by ID
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/summary` - Get income/expense summary

#### Budget Service (requires JWT)
- `GET /api/budgets/user/{userId}` - Get user's budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

#### Debt Service (requires JWT)
- `GET /api/debts/user/{userId}` - Get user's debts
- `POST /api/debts` - Create debt
- `POST /api/debts/payments` - Record payment
- `GET /api/debts/{id}` - Get debt by ID
- `DELETE /api/debts/{id}` - Delete debt

#### Dashboard Service (requires JWT)
- `GET /api/dashboard/summary` - Get dashboard summary

## Testing

### Backend Tests
```bash
# Run unit tests
cd services/<service-name>
mvn test

# Run integration tests with Testcontainers
mvn test -Dtest=*IntegrationTest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Database Schema

### Auth Schema
- `user_profiles`: id, email, password, preferred_currency, created_at, updated_at

### Transactions Schema
- `transactions`: id, user_id, type, amount, category, date, description, created_at

### Budget Schema
- `budgets`: id, user_id, category, month, year, spending_limit, created_at, updated_at

### Debt Schema
- `debts`: id, user_id, name, original_balance, current_balance, apr, minimum_payment, due_date, created_at, updated_at
- `debt_payments`: id, user_id, debt_id, amount, payment_date, note, created_at

## Security Notes

- Users can only access their own data (transactions, budgets, debts)
- JWT tokens are validated at the gateway level
- User IDs from requests are overridden with authenticated user IDs
- All services verify ownership before allowing modifications
- Cross-user access attempts throw SecurityException


