-- Keep one clearly labeled sample transaction for the requested demo account.
INSERT INTO transactions (id, user_id, type, amount, category_name, date, description, created_at)
VALUES (
    '950e8400-e29b-41d4-a716-446655440050',
    '123e4567-e89b-12d3-a456-426614174000',
    'INCOME',
    50000.00,
    'Bonus',
    CURRENT_DATE,
    'One-time $50,000 sample income',
    NOW()
)
ON CONFLICT (id) DO NOTHING;
