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
  - Accounts Service (port 8086)
  - Chatbot Service (port 8087)
  - Agent Service (port 8088) - LangGraph/LangChain finance agent
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

### Observability Stack
- **Prometheus** (port 9090) — scrapes `/actuator/prometheus` from every service every 15s
- **Grafana** (port 3001, admin/admin) — auto-provisioned Prometheus datasource and "Finance Services Overview" dashboard
- **Elasticsearch** (port 9200) + **Kibana** (port 5601) — centralized logs
- **Filebeat** — ships container JSON logs into Elasticsearch (`finance-logs-*` indices)

Monitoring configs live in `infrastructure/monitoring/`. Set `GRAFANA_ADMIN_PASSWORD` in `.env` to change the Grafana admin password.

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
cd services/accounts-service && mvn spring-boot:run
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
- `GET /api/transactions/account/{accountId}` - Get transactions for an account
- `GET /api/transactions/card/{cardId}` - Get transactions for a card

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

#### Accounts Service (requires JWT)
- `GET /api/accounts` - Get all accounts (user's own)
- `POST /api/accounts` - Create account
- `GET /api/accounts/{id}` - Get account by ID
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

#### Cards Service (requires JWT)
- `GET /api/cards` - Get all cards (user's own)
- `POST /api/cards` - Create card (optionally linked to an account)
- `GET /api/cards/{id}` - Get card by ID
- `GET /api/cards/account/{accountId}` - Get cards for an account
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card

#### Dashboard Service (requires JWT)
- `GET /api/dashboard/summary` - Get dashboard summary

#### Chatbot Service (requires JWT)
- `POST /api/chat` - Send a chat message `{ message, includeFinanceData, history? }`
- `GET /api/chat/status` - Which LLM provider is configured (`openai`, `anthropic`, `gemini`, or `none`)

#### Agent Service (requires JWT, Python/LangGraph)
- `POST /api/agent/chat` - Agent chat with tool use: `{ message, history? }` -> `{ reply, provider, actions_taken }`
- `GET /api/agent/status` - Configured LLM provider
- `GET/POST /api/agent/goals`, `POST /api/agent/goals/{id}/contribute`, `GET /api/agent/goals/{id}/plan`, `DELETE /api/agent/goals/{id}` - Savings goals (stored in Postgres `agent` schema)
- `GET /api/agent/debts/payoff-plan?extra_monthly_payment=N` - Avalanche vs snowball simulation analyzing all debts and payments

Agent tools: add_transaction, create_budget, create_debt, record_debt_payment,
create_savings_goal, contribute_to_goal, get_savings_plan, get_payoff_plan,
get_finance_summary, list_savings_goals.

The chatbot auto-detects its provider from environment variables in this order:
`OPENAI_API_KEY` → `ANTHROPIC_API_KEY` → `GEMINI_API_KEY` (see `.env.example`).
The frontend widget is available on every screen; finance data is only included
when the user explicitly enables the "Let assistant see my finance data" toggle.

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
- `transactions`: id, user_id, type, amount, category_name, category_id, account_id, card_id, date, description, created_at

### Budget Schema
- `budgets`: id, user_id, category, month, year, spending_limit, created_at, updated_at

### Debt Schema
- `debts`: id, user_id, name, original_balance, current_balance, apr, minimum_payment, due_date, created_at, updated_at
- `debt_payments`: id, user_id, debt_id, amount, payment_date, note, created_at

### Account Schema
- `accounts`: id, user_id, name, institution, account_type, currency, current_balance, is_active, created_at, updated_at
- `cards`: id, user_id, account_id, name, card_type, last_four, network, credit_limit, current_balance, apr, expiry_month, expiry_year, is_active, created_at, updated_at

### Transactions (linking)
- `transactions.account_id` / `transactions.card_id` optionally link a transaction to an account/card

## Security Notes

- Users can only access their own data (transactions, budgets, debts)
- JWT tokens are validated at the gateway level
- User IDs from requests are overridden with authenticated user IDs
- All services verify ownership before allowing modifications
- Cross-user access attempts throw SecurityException

## Test Data

Generate ~100k records across all tables (transactions, budgets, debts,
debt payments, accounts, cards) spanning 24 months with edge cases:

```bash
cd scripts
python3 generate_test_data.py   # writes *.json files

# Fast path: bulk insert straight into PostgreSQL (recommended)
python3 load_data_direct.py

# Slow path: via the API gateway (~1 request per record)
python3 load_data_to_db.py
```

`load_data_direct.py` registers/logs in `test@example.com` via the auth API
(fallback: pass `--user-id UUID`), resolves category IDs, and remaps
account/card/debt foreign keys automatically.


