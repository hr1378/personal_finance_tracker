CREATE SCHEMA IF NOT EXISTS debt;

CREATE TABLE debt.debts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    original_balance NUMERIC(19, 2) NOT NULL,
    current_balance NUMERIC(19, 2) NOT NULL,
    apr NUMERIC(5, 2) NOT NULL,
    minimum_payment NUMERIC(19, 2) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE debt.debt_payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    debt_id UUID NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    payment_date DATE NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);
