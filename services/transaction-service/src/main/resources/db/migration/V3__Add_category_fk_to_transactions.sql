ALTER TABLE transactions
ADD COLUMN category_id UUID,
ADD CONSTRAINT fk_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL;
