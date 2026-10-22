-- Database setup script for Personal Finance Tracker
-- Run this in PostgreSQL to create the database and user

CREATE DATABASE finance_tracker;
CREATE USER finance_user WITH PASSWORD 'finance_password';
GRANT ALL PRIVILEGES ON DATABASE finance_tracker TO finance_user;

-- Connect to the database and grant schema permissions
\c finance_tracker
GRANT ALL ON SCHEMA public TO finance_user;
