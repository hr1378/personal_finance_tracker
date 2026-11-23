-- Remove deterministic sample debt rows and their sample payment history.
DELETE FROM debt.debt_payments
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
OR id IN (
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440032',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

DELETE FROM debt.debts
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
OR id IN (
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440022',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);
