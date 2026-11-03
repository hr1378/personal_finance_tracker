-- Initialize database schemas for all services
-- This script runs when the database is first created

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS transaction;
CREATE SCHEMA IF NOT EXISTS budget;
CREATE SCHEMA IF NOT EXISTS debt;
CREATE SCHEMA IF NOT EXISTS dashboard;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA auth TO finance_user;
GRANT ALL PRIVILEGES ON SCHEMA transaction TO finance_user;
GRANT ALL PRIVILEGES ON SCHEMA budget TO finance_user;
GRANT ALL PRIVILEGES ON SCHEMA debt TO finance_user;
GRANT ALL PRIVILEGES ON SCHEMA dashboard TO finance_user;
