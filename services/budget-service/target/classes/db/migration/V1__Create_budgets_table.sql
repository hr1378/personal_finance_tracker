CREATE SCHEMA IF NOT EXISTS budget;

CREATE TABLE budget.budgets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    spending_limit NUMERIC(19, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
