-- Remove only the fixed sample identities previously created by repository seed scripts.
DELETE FROM identity.user_profiles
WHERE (id = '6781eb95-a249-492e-a4cb-fe0032aa2f48' AND email = 'test@example.com')
   OR (id = '550e8400-e29b-41d4-a716-446655440000' AND email = 'john.doe@example.com');
