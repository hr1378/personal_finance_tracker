-- Seed budgets for demo user
INSERT INTO budget.budgets (id, user_id, category, month, year, spending_limit, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '123e4567-e89b-12d3-a456-426614174000', 'Housing', 11, 2026, 1500.00, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', '123e4567-e89b-12d3-a456-426614174000', 'Food', 11, 2026, 500.00, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', '123e4567-e89b-12d3-a456-426614174000', 'Transportation', 11, 2026, 200.00, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '123e4567-e89b-12d3-a456-426614174000', 'Entertainment', 11, 2026, 300.00, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '123e4567-e89b-12d3-a456-426614174000', 'Utilities', 11, 2026, 250.00, NOW(), NOW());
