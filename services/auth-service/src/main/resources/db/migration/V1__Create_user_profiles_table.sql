CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE identity.user_profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    preferred_currency VARCHAR(3),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
