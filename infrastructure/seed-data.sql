-- Seed data for testing
-- Run this after the application is running

-- Insert sample user (if not exists)
INSERT INTO auth.user_profiles (id, email, password, preferred_currency, created_at, updated_at)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'demo@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: password123
    'USD',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO public.categories (id, name, type, created_at)
VALUES
    ('11111111-0000-0000-0000-000000000001', 'Salary', 'INCOME', NOW()),
    ('11111111-0000-0000-0000-000000000002', 'Housing', 'EXPENSE', NOW()),
    ('11111111-0000-0000-0000-000000000003', 'Food', 'EXPENSE', NOW()),
    ('11111111-0000-0000-0000-000000000004', 'Transportation', 'EXPENSE', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample transactions
INSERT INTO public.transactions (id, user_id, type, amount, category_name, date, description, created_at, category_id)
VALUES
    ('11111111-1111-1111-1111-111111111111', '123e4567-e89b-12d3-a456-426614174000', 'INCOME', 5000.00, 'Salary', '2026-11-01', 'Monthly salary', NOW(), '11111111-0000-0000-0000-000000000001'),
    ('22222222-2222-2222-2222-222222222222', '123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 1200.00, 'Housing', '2026-11-02', 'Rent payment', NOW(), '11111111-0000-0000-0000-000000000002'),
    ('33333333-3333-3333-3333-333333333333', '123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 300.00, 'Food', '2026-11-03', 'Groceries', NOW(), '11111111-0000-0000-0000-000000000003'),
    ('44444444-4444-4444-4444-444444444444', '123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 150.00, 'Transportation', '2026-11-03', 'Gas', NOW(), '11111111-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Insert sample budgets
INSERT INTO budget.budgets (id, user_id, category, spending_limit, month, year, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '123e4567-e89b-12d3-a456-426614174000', 'Housing', 1500.00, 11, 2026, NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '123e4567-e89b-12d3-a456-426614174000', 'Food', 500.00, 11, 2026, NOW(), NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '123e4567-e89b-12d3-a456-426614174000', 'Transportation', 200.00, 11, 2026, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample debts
INSERT INTO debt.debts (id, user_id, name, original_balance, current_balance, apr, minimum_payment, due_date, created_at, updated_at)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '123e4567-e89b-12d3-a456-426614174000', 'Credit Card', 5000.00, 3500.00, 18.99, 150.00, '2026-12-15', NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '123e4567-e89b-12d3-a456-426614174000', 'Student Loan', 25000.00, 22000.00, 4.50, 300.00, '2026-12-01', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample debt payments
INSERT INTO debt.debt_payments (id, user_id, debt_id, amount, payment_date, note, created_at)
VALUES
    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '123e4567-e89b-12d3-a456-426614174000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 500.00, '2026-11-01', 'Monthly payment', NOW()),
    ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '123e4567-e89b-12d3-a456-426614174000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 300.00, '2026-11-01', 'Monthly payment', NOW())
ON CONFLICT DO NOTHING;
