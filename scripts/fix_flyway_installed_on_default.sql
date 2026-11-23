-- Flyway relies on a database default when it records newly applied migrations.
-- The Supabase bootstrap script previously created these columns without one.
DO $$
DECLARE
    schema_name TEXT;
BEGIN
    FOREACH schema_name IN ARRAY ARRAY[
        'identity', 'account', 'budget', 'debt', 'dashboard', 'public'
    ] LOOP
        IF to_regclass(schema_name || '.flyway_schema_history') IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.flyway_schema_history ALTER COLUMN installed_on SET DEFAULT CURRENT_TIMESTAMP',
                schema_name
            );
        END IF;
    END LOOP;
END $$;
