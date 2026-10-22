CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);
