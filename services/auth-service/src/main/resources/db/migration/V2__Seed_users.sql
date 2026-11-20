-- Seed users with BCrypt hashed passwords
-- Password: password123
INSERT INTO identity.user_profiles (id, email, password, preferred_currency, created_at, updated_at) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'demo@example.com', '$2b$10$qDUknlmTVy0zA5/gyDnyueG9QkvZ6DfGpAPNymiQD1QW8VbsoPZAW', 'USD', NOW(), NOW()),
('6781eb95-a249-492e-a4cb-fe0032aa2f48', 'test@example.com', '$2b$10$qDUknlmTVy0zA5/gyDnyueG9QkvZ6DfGpAPNymiQD1QW8VbsoPZAW', 'USD', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
