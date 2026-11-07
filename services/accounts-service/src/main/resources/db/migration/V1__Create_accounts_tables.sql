CREATE SCHEMA IF NOT EXISTS account;

CREATE TABLE account.accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('CHECKING', 'SAVINGS', 'MONEY_MARKET')),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    current_balance NUMERIC(19, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE account.cards (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    account_id UUID REFERENCES account.accounts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('CREDIT', 'DEBIT')),
    last_four VARCHAR(4),
    network VARCHAR(20) CHECK (network IN ('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'OTHER')),
    credit_limit NUMERIC(19, 2),
    current_balance NUMERIC(19, 2) NOT NULL DEFAULT 0,
    apr NUMERIC(5, 2),
    expiry_month INTEGER CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_accounts_user_id ON account.accounts(user_id);
CREATE INDEX idx_cards_user_id ON account.cards(user_id);
CREATE INDEX idx_cards_account_id ON account.cards(account_id);
