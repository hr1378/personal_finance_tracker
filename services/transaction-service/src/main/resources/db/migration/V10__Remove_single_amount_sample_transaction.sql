-- The prior example was one $50,000 row; the bulk seed script replaces it
-- with 50,000 individual transactions for this account.
DELETE FROM transactions
WHERE id = '950e8400-e29b-41d4-a716-446655440050'
  AND user_id = '123e4567-e89b-12d3-a456-426614174000'
  AND description = 'One-time $50,000 sample income';
