-- Seed Realistic Financial Data with auto-generated UUIDs
-- This script creates schemas, tables, and inserts realistic financial data

-- Create Schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS budget;
CREATE SCHEMA IF NOT EXISTS debt;

-- Create Tables
CREATE TABLE IF NOT EXISTS auth.user_profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    preferred_currency VARCHAR(3),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS budget.budgets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    spending_limit NUMERIC(19, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS debt.debts (
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

CREATE TABLE IF NOT EXISTS debt.debt_payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    debt_id UUID NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    payment_date DATE NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);

-- Insert User Profile
INSERT INTO auth.user_profiles (id, email, password, preferred_currency, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'john.doe@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'USD',
    '2025-01-15 08:30:00',
    '2026-10-22 10:00:00'
);

-- Insert Income Transactions (Salary - monthly $8,500)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       'INCOME', 8500.00, 'Salary', 
       date_series::date, 
       'Monthly salary', 
       date_series::timestamp
FROM generate_series('2026-01-31'::date, '2026-10-22'::date, interval '1 month') AS date_series
WHERE extract(day from date_series) >= 28;

-- Insert Rental Income (monthly $1,800)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       'INCOME', 1800.00, 'Rental', 
       date_series::date, 
       'Monthly rent - Property 1', 
       date_series::timestamp
FROM generate_series('2026-01-01'::date, '2026-10-01'::date, interval '1 month') AS date_series;

-- Insert Freelance Income (random amounts)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 2800.00, 'Freelance', '2026-01-15', 'Web development project', '2026-01-15 14:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 1500.00, 'Freelance', '2026-02-20', 'Logo design package', '2026-02-20 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 3200.00, 'Freelance', '2026-03-10', 'Mobile app consultation', '2026-03-10 11:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 4500.00, 'Freelance', '2026-06-22', 'E-commerce website build', '2026-06-22 10:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 2800.00, 'Freelance', '2026-10-05', 'Performance optimization', '2026-10-05 16:00:00');

-- Insert Investment Income
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 425.00, 'Investment', '2026-01-15', 'Stock dividends - Q1', '2026-01-15 09:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 380.00, 'Investment', '2026-04-15', 'Stock dividends - Q2', '2026-04-15 09:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 520.00, 'Investment', '2026-07-15', 'Stock dividends - Q3', '2026-07-15 09:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 450.00, 'Investment', '2026-10-15', 'Stock dividends - Q4', '2026-10-15 09:00:00');

-- Insert Bonus
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'INCOME', 5000.00, 'Bonus', '2026-06-30', 'Performance bonus - H1', '2026-06-30 14:00:00');

-- Insert Rent Expenses (monthly $2,800)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       'EXPENSE', 2800.00, 'Rent', 
       date_series::date, 
       'Monthly rent payment', 
       date_series::timestamp
FROM generate_series('2026-01-01'::date, '2026-10-01'::date, interval '1 month') AS date_series;

-- Insert Utilities (monthly)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 185.00, 'Utilities', '2026-01-15', 'Electric and water bill', '2026-01-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 172.00, 'Utilities', '2026-02-15', 'Electric and water bill', '2026-02-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 195.00, 'Utilities', '2026-03-15', 'Electric and water bill', '2026-03-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 168.00, 'Utilities', '2026-04-15', 'Electric and water bill', '2026-04-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 210.00, 'Utilities', '2026-05-15', 'Electric and water bill', '2026-05-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 189.00, 'Utilities', '2026-06-15', 'Electric and water bill', '2026-06-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 175.00, 'Utilities', '2026-07-15', 'Electric and water bill', '2026-07-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 198.00, 'Utilities', '2026-08-15', 'Electric and water bill', '2026-08-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 166.00, 'Utilities', '2026-09-15', 'Electric and water bill', '2026-09-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 192.00, 'Utilities', '2026-10-15', 'Electric and water bill', '2026-10-15 12:00:00');

-- Insert Internet (monthly $89.99)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       'EXPENSE', 89.99, 'Internet', 
       date_series::date, 
       'Monthly internet and phone', 
       date_series::timestamp
FROM generate_series('2026-01-05'::date, '2026-10-05'::date, interval '1 month') AS date_series;

-- Insert Groceries (weekly ~$500)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       'EXPENSE', 480 + (random() * 80)::numeric(10,2), 'Groceries', 
       date_series::date, 
       'Weekly grocery shopping', 
       date_series::timestamp
FROM generate_series('2026-01-08'::date, '2026-10-22'::date, interval '7 days') AS date_series;

-- Insert Transportation (gas)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 65.00, 'Transportation', '2026-01-10', 'Gas fill-up', '2026-01-10 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 72.50, 'Transportation', '2026-01-24', 'Gas fill-up', '2026-01-24 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 68.00, 'Transportation', '2026-02-07', 'Gas fill-up', '2026-02-07 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 75.25, 'Transportation', '2026-02-21', 'Gas fill-up', '2026-02-21 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 125.00, 'Transportation', '2026-06-12', 'Car maintenance - oil change', '2026-06-12 10:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 70.00, 'Transportation', '2026-06-25', 'Gas fill-up', '2026-06-25 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 68.25, 'Transportation', '2026-10-01', 'Gas fill-up', '2026-10-01 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 75.50, 'Transportation', '2026-10-15', 'Gas fill-up', '2026-10-15 16:00:00');

-- Insert Dining Out
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 85.50, 'Dining', '2026-01-12', 'Dinner with friends', '2026-01-12 19:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 42.25, 'Dining', '2026-01-20', 'Lunch at work', '2026-01-20 12:30:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 95.00, 'Dining', '2026-02-03', 'Date night dinner', '2026-02-03 20:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 67.50, 'Dining', '2026-02-28', 'Team lunch', '2026-02-28 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 52.00, 'Dining', '2026-03-08', 'Coffee and pastry', '2026-03-08 09:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 88.25, 'Dining', '2026-03-17', 'Weekend brunch', '2026-03-17 11:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 72.00, 'Dining', '2026-04-05', 'Dinner with family', '2026-04-05 19:30:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 92.75, 'Dining', '2026-04-20', 'Birthday dinner', '2026-04-20 20:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 78.50, 'Dining', '2026-05-10', 'Dinner out', '2026-05-10 19:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 85.00, 'Dining', '2026-06-14', 'Father''s Day dinner', '2026-06-14 19:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 74.25, 'Dining', '2026-07-04', 'Independence Day dinner', '2026-07-04 20:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 68.75, 'Dining', '2026-08-20', 'Dinner out', '2026-08-20 20:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 91.25, 'Dining', '2026-09-01', 'Labor Day BBQ', '2026-09-01 17:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 79.00, 'Dining', '2026-09-15', 'Dinner with friends', '2026-09-15 19:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 85.50, 'Dining', '2026-10-06', 'Weekend dinner', '2026-10-06 20:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 72.25, 'Dining', '2026-10-20', 'Dinner out', '2026-10-20 19:00:00');

-- Insert Entertainment
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 15.99, 'Entertainment', '2026-01-01', 'Netflix subscription', '2026-01-01 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 9.99, 'Entertainment', '2026-01-05', 'Spotify subscription', '2026-01-05 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 14.99, 'Entertainment', '2026-01-10', 'Disney+ subscription', '2026-01-10 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 45.00, 'Entertainment', '2026-01-15', 'Movie tickets', '2026-01-15 18:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 65.00, 'Entertainment', '2026-02-20', 'Concert tickets', '2026-02-20 19:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 52.50, 'Entertainment', '2026-03-25', 'Bowling with friends', '2026-03-25 20:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 38.00, 'Entertainment', '2026-04-18', 'Escape room', '2026-04-18 15:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 75.00, 'Entertainment', '2026-05-22', 'NBA game tickets', '2026-05-22 19:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 42.00, 'Entertainment', '2026-06-25', 'Mini golf', '2026-06-25 14:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 55.00, 'Entertainment', '2026-07-20', 'Comedy show', '2026-07-20 20:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 48.00, 'Entertainment', '2026-08-28', 'Museum tickets', '2026-08-28 11:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 62.00, 'Entertainment', '2026-09-18', 'Arcade and games', '2026-09-18 19:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 58.00, 'Entertainment', '2026-10-21', 'Movie tickets', '2026-10-21 18:00:00');

-- Insert Healthcare
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 25.00, 'Healthcare', '2026-01-08', 'Prescription medication', '2026-01-08 14:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 150.00, 'Healthcare', '2026-02-15', 'Doctor visit copay', '2026-02-15 10:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 45.00, 'Healthcare', '2026-03-20', 'Dental cleaning', '2026-03-20 09:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 30.00, 'Healthcare', '2026-04-12', 'Prescription refill', '2026-04-12 15:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 200.00, 'Healthcare', '2026-05-08', 'Eye exam', '2026-05-08 11:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 180.00, 'Healthcare', '2026-06-18', 'Physical therapy session', '2026-06-18 14:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 120.00, 'Healthcare', '2026-08-22', 'Specialist consultation', '2026-08-22 13:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 150.00, 'Healthcare', '2026-10-19', 'Annual checkup', '2026-10-19 10:00:00');

-- Insert Shopping
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 125.00, 'Shopping', '2026-01-18', 'New clothes', '2026-01-18 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 85.50, 'Shopping', '2026-02-25', 'Winter boots', '2026-02-25 14:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 175.00, 'Shopping', '2026-03-12', 'Work attire', '2026-03-12 15:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 95.00, 'Shopping', '2026-04-08', 'Spring jacket', '2026-04-08 13:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 210.00, 'Shopping', '2026-05-15', 'Gym equipment', '2026-05-15 12:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 145.00, 'Shopping', '2026-06-20', 'Summer clothes', '2026-06-20 14:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 68.00, 'Shopping', '2026-07-13', 'Accessories', '2026-07-13 16:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 185.00, 'Shopping', '2026-08-17', 'New backpack', '2026-08-17 15:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 92.50, 'Shopping', '2026-09-09', 'Fall wardrobe', '2026-09-09 14:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 155.00, 'Shopping', '2026-10-11', 'Home supplies', '2026-10-11 13:00:00');

-- Insert Insurance (monthly $125)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       'EXPENSE', 125.00, 'Insurance', 
       date_series::date, 
       'Health insurance premium', 
       date_series::timestamp
FROM generate_series('2026-01-01'::date, '2026-10-01'::date, interval '1 month') AS date_series;

-- Insert Education
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-01-15', 'Online course subscription', '2026-01-15 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-02-15', 'Online course subscription', '2026-02-15 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-03-15', 'Online course subscription', '2026-03-15 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-04-15', 'Online course subscription', '2026-04-15 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 49.00, 'Education', '2026-05-20', 'Technical book', '2026-05-20 10:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-06-15', 'Online course subscription', '2026-06-15 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-07-15', 'Online course subscription', '2026-07-15 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-08-15', 'Online course subscription', '2026-08-15 08:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 79.00, 'Education', '2026-09-10', 'Workshop registration', '2026-09-10 09:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'EXPENSE', 29.99, 'Education', '2026-10-15', 'Online course subscription', '2026-10-15 08:00:00');

-- Insert Fitness (monthly $65)
INSERT INTO transactions (id, user_id, type, amount, category, date, description, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       'EXPENSE', 65.00, 'Fitness', 
       date_series::date, 
       'Gym membership', 
       date_series::timestamp
FROM generate_series('2026-01-01'::date, '2026-10-01'::date, interval '1 month') AS date_series;

-- Insert Budgets
INSERT INTO budget.budgets (id, user_id, category, month, year, spending_limit, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Groceries', 10, 2026, 600.00, '2026-10-01 00:00:00', '2026-10-01 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Dining', 10, 2026, 300.00, '2026-10-01 00:00:00', '2026-10-01 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Entertainment', 10, 2026, 200.00, '2026-10-01 00:00:00', '2026-10-01 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Transportation', 10, 2026, 200.00, '2026-10-01 00:00:00', '2026-10-01 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Shopping', 10, 2026, 300.00, '2026-10-01 00:00:00', '2026-10-01 00:00:00');

-- Insert Debts
INSERT INTO debt.debts (id, user_id, name, original_balance, current_balance, apr, minimum_payment, due_date, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Chase Sapphire Credit Card', 8500.00, 5200.00, 18.99, 170.00, '2026-11-15', '2025-01-15 00:00:00', '2026-10-22 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Capital One Venture', 3200.00, 1800.00, 17.49, 64.00, '2026-11-20', '2025-03-20 00:00:00', '2026-10-22 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Student Loan - Federal', 35000.00, 28500.00, 4.50, 350.00, '2026-11-01', '2024-06-01 00:00:00', '2026-10-22 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Car Loan - Toyota', 22000.00, 14500.00, 5.99, 420.00, '2026-11-10', '2024-02-10 00:00:00', '2026-10-22 00:00:00'),
(gen_random_uuid(), (SELECT id FROM auth.user_profiles LIMIT 1), 'Personal Loan - SoFi', 15000.00, 9200.00, 9.99, 320.00, '2026-11-25', '2024-08-25 00:00:00', '2026-10-22 00:00:00');

-- Insert Debt Payments (Credit Card)
INSERT INTO debt.debt_payments (id, user_id, debt_id, amount, payment_date, note, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       (SELECT id FROM debt.debts WHERE name = 'Chase Sapphire Credit Card' LIMIT 1),
       170.00, 
       date_series::date, 
       'Monthly payment', 
       date_series::timestamp
FROM generate_series('2026-01-15'::date, '2026-10-15'::date, interval '1 month') AS date_series;

-- Insert Debt Payments (Car Loan)
INSERT INTO debt.debt_payments (id, user_id, debt_id, amount, payment_date, note, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       (SELECT id FROM debt.debts WHERE name = 'Car Loan - Toyota' LIMIT 1),
       420.00, 
       date_series::date, 
       'Monthly payment', 
       date_series::timestamp
FROM generate_series('2026-01-10'::date, '2026-10-10'::date, interval '1 month') AS date_series;

-- Insert Debt Payments (Student Loan)
INSERT INTO debt.debt_payments (id, user_id, debt_id, amount, payment_date, note, created_at)
SELECT gen_random_uuid(), 
       (SELECT id FROM auth.user_profiles LIMIT 1),
       (SELECT id FROM debt.debts WHERE name = 'Student Loan - Federal' LIMIT 1),
       350.00, 
       date_series::date, 
       'Monthly payment', 
       date_series::timestamp
FROM generate_series('2026-01-01'::date, '2026-10-01'::date, interval '1 month') AS date_series;
