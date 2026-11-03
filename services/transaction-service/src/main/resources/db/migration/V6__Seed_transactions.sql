-- Seed transactions for demo user
INSERT INTO transactions (id, user_id, type, amount, category_name, date, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '123e4567-e89b-12d3-a456-426614174000', 'INCOME', 5000.00, 'Salary', '2026-11-01', 'Monthly salary', NOW()),
('550e8400-e29b-41d4-a716-446655440002', '123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 1500.00, 'Housing', '2026-11-02', 'Rent payment', NOW()),
('550e8400-e29b-41d4-a716-446655440003', '123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 450.00, 'Food', '2026-11-03', 'Groceries', NOW()),
('550e8400-e29b-41d4-a716-446655440004', '123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 200.00, 'Transportation', '2026-11-04', 'Gas and parking', NOW()),
('550e8400-e29b-41d4-a716-446655440005', '123e4567-e89b-12d3-a456-426614174000', 'EXPENSE', 100.00, 'Entertainment', '2026-11-05', 'Movies and dining', NOW());
