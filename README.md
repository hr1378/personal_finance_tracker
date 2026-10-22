# Personal Finance Tracker

A clean, modern Personal Finance Tracker web application built with React, TypeScript, Spring Boot, and PostgreSQL. Features a professional UI with responsive design, proper validation, and intuitive user experience.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Java 21
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- Maven

### Database
- PostgreSQL
- Flyway for database migrations

## Project Structure

```
personal-finance-tracker/
├── frontend/                    # React frontend application
├── services/
│   └── transaction-service/     # Spring Boot backend service
├── infrastructure/
│   └── database/                # Database setup scripts
└── README.md
```

## Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL 12+
- Maven 3.8+

## Database Setup

1. Create a PostgreSQL database using the provided script:
```bash
psql -U postgres -f infrastructure/database/setup.sql
```

Or manually run:
```sql
CREATE DATABASE finance_tracker;
CREATE USER finance_user WITH PASSWORD 'finance_password';
GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO finance_user;
\c finance_tracker
GRANT ALL ON SCHEMA public TO finance_user;
```

2. Update database credentials in `services/transaction-service/src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/finance_tracker
spring.datasource.username=finance_user
spring.datasource.password=finance_password
```

## Backend Setup

1. Ensure Java 21 is being used (if you have multiple Java versions installed):
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

2. Navigate to the transaction service:
```bash
cd services/transaction-service
```

3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

Flyway will automatically run migrations on startup and create the `transactions` table.

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (already done if using the existing setup):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

- `POST /api/transactions` — Create a transaction
- `GET /api/transactions` — Retrieve all transactions (with optional `?type=INCOME` or `?type=EXPENSE` filter)
- `GET /api/transactions/{id}` — Retrieve a single transaction
- `DELETE /api/transactions/{id}` — Delete a transaction
- `GET /api/transactions/summary` — Retrieve financial totals (income, expenses, net cash flow)

## Features

- Add income and expense transactions
- View all transactions in a table
- Filter transactions by type (All, Income, Expenses)
- Delete transactions
- View summary with total income, total expenses, and net cash flow
- Data persists in PostgreSQL database

## Running the Application

1. Start PostgreSQL database
2. Start the backend: `cd services/transaction-service && mvn spring-boot:run`
3. Start the frontend: `cd frontend && npm run dev`
4. Open `http://localhost:5173` in your browser

## Transaction Schema

The `transactions` table contains:
- `id`: UUID (primary key)
- `type`: INCOME or EXPENSE
- `amount`: NUMERIC(19, 2)
- `category`: VARCHAR(100)
- `date`: DATE
- `description`: VARCHAR(500) (optional)
- `created_at`: TIMESTAMP
