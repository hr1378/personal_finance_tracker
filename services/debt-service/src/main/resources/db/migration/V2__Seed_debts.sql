-- Seed debts for demo user
INSERT INTO debt.debts (id, user_id, name, original_balance, current_balance, apr, minimum_payment, due_date, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', '123e4567-e89b-12d3-a456-426614174000', 'Credit Card', 5000.00, 4500.00, 18.99, 150.00, '2026-11-15', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', '123e4567-e89b-12d3-a456-426614174000', 'Student Loan', 25000.00, 22000.00, 5.50, 200.00, '2026-11-20', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '123e4567-e89b-12d3-a456-426614174000', 'Car Loan', 15000.00, 12000.00, 4.50, 350.00, '2026-11-25', NOW(), NOW());

-- Seed debt payments for demo user
INSERT INTO debt.debt_payments (id, user_id, debt_id, amount, payment_date, note, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440030', '123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440020', 150.00, '2026-10-15', 'Monthly payment', NOW()),
('550e8400-e29b-41d4-a716-446655440031', '123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440021', 200.00, '2026-10-20', 'Monthly payment', NOW()),
('550e8400-e29b-41d4-a716-446655440032', '123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440022', 350.00, '2026-10-25', 'Monthly payment', NOW());
