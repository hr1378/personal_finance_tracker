ALTER TABLE transactions
ADD COLUMN account_id UUID,
ADD COLUMN card_id UUID;

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_user_account ON transactions(user_id, account_id);
CREATE INDEX idx_transactions_user_card ON transactions(user_id, card_id);
