CREATE SCHEMA IF NOT EXISTS dashboard;

CREATE TABLE dashboard.dashboard_snapshots (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    income_total NUMERIC(19, 2) NOT NULL,
    expense_total NUMERIC(19, 2) NOT NULL,
    outstanding_debt NUMERIC(19, 2) NOT NULL,
    generated_at TIMESTAMP NOT NULL
);
