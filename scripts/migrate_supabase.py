#!/usr/bin/env python3
"""Migrate the schema and seed 50,000 transactions for demo@example.com.

Applies each service migration to Supabase and records it in Flyway history.
Then tops up only the target account to 50,000 transaction rows, preserving
other user data and making repeated runs safe.

Usage:
    SUPABASE_DATABASE_URL='postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres' \
        python3 scripts/migrate_supabase.py
"""

import os
import re
import zlib
import uuid
import random
import datetime
from pathlib import Path

import psycopg2
from psycopg2.extras import execute_values

ROOT = Path(__file__).resolve().parent.parent

# service dir name -> flyway schema (matches spring.flyway.schemas)
SERVICES = {
    "auth-service": "identity",
    "accounts-service": "account",
    "budget-service": "budget",
    "debt-service": "debt",
    "dashboard-service": "dashboard",
    "transaction-service": "public",
}

HISTORY_DDL = """
CREATE TABLE IF NOT EXISTS {schema}.flyway_schema_history (
    installed_rank INT NOT NULL,
    version VARCHAR(50),
    description VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    script VARCHAR(1000) NOT NULL,
    checksum INT,
    installed_by VARCHAR(100) NOT NULL,
    installed_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time INT NOT NULL,
    success BOOLEAN NOT NULL
);
"""


def flyway_checksum(path: Path) -> int:
    """Flyway CRC32s each line (line terminators stripped) as UTF-8, signed int."""
    data = "".join(path.read_text(encoding="utf-8").splitlines()).encode("utf-8")
    c = zlib.crc32(data) & 0xFFFFFFFF
    return c - 0x100000000 if c >= 0x80000000 else c


def migration_files(service_dir: Path):
    mig_dir = service_dir / "src/main/resources/db/migration"
    files = []
    for f in mig_dir.glob("V*__*.sql"):
        m = re.match(r"V(\d+)__(.+)\.sql$", f.name)
        if m:
            files.append((int(m.group(1)), m.group(2), f))
    return sorted(files, key=lambda t: t[0])


def apply_migrations(conn):
    cur = conn.cursor()
    rank = {}
    for service, schema in SERVICES.items():
        cur.execute(f"CREATE SCHEMA IF NOT EXISTS {schema}")
        cur.execute(HISTORY_DDL.format(schema=schema))
        # Existing history tables may have been created by an earlier version
        # of this script without a default. Flyway's own inserts rely on one.
        cur.execute(
            f"ALTER TABLE {schema}.flyway_schema_history "
            "ALTER COLUMN installed_on SET DEFAULT CURRENT_TIMESTAMP"
        )
        rank[schema] = cur.execute(
            f"SELECT COALESCE(MAX(installed_rank),0) FROM {schema}.flyway_schema_history"
        ) or 0
        cur.execute(
            f"SELECT COALESCE(MAX(installed_rank),0) FROM {schema}.flyway_schema_history"
        )
        rank[schema] = cur.fetchone()[0]
        cur.execute(
            f"SELECT script FROM {schema}.flyway_schema_history WHERE success"
        )
        applied = {r[0] for r in cur.fetchall()}

        for version, desc, path in migration_files(ROOT / "services" / service):
            if path.name in applied:
                continue
            sql = path.read_text()
            cur.execute(f"SET search_path TO {schema}, public")
            cur.execute(sql)
            rank[schema] += 1
            cur.execute(
                f"""INSERT INTO {schema}.flyway_schema_history
                    (installed_rank, version, description, type, script, checksum,
                     installed_by, installed_on, execution_time, success)
                    VALUES (%s,%s,%s,'SQL',%s,%s,'postgres',NOW(),0,true)""",
                (
                    rank[schema],
                    str(version),
                    desc.replace("_", " "),
                    path.name,
                    flyway_checksum(path),
                ),
            )
        conn.commit()
        print(f"[{schema}] applied migrations for {service}")


TARGET_EMAIL = "demo@example.com"
TARGET_TRANSACTION_COUNT = 50_000
ONE_OFF_SAMPLE_TRANSACTION_ID = "950e8400-e29b-41d4-a716-446655440050"

EXPENSE_CATEGORIES = [
    ("Food & Dining", (5, 120)), ("Transportation", (10, 90)),
    ("Housing", (800, 2200)), ("Entertainment", (15, 150)),
    ("Shopping", (20, 300)), ("Healthcare", (20, 400)),
    ("Education", (0, 250)), ("Utilities", (60, 350)),
    ("Debt Payments", (100, 600)), ("Savings", (50, 800)),
    ("Other", (5, 100)),
]
INCOME_CATEGORIES = [
    ("Salary", (2500, 6500)), ("Freelance", (200, 2500)),
    ("Investments", (10, 500)), ("Gifts", (20, 500)),
]
DESCRIPTIONS = {
    "Salary": ["Monthly salary", "Payroll deposit"],
    "Freelance": ["Freelance project payout", "Consulting invoice"],
    "Investments": ["Dividend payment", "Interest income"],
    "Gifts": ["Gift received", "Bonus"],
    "Food & Dining": ["Groceries", "Restaurant dinner", "Coffee", "Takeout", "Lunch"],
    "Transportation": ["Gas", "Public transit", "Rideshare", "Parking", "Car insurance"],
    "Housing": ["Rent payment", "Mortgage", "Electricity bill", "Water bill", "Internet"],
    "Entertainment": ["Movie tickets", "Streaming subscription", "Concert", "Game purchase"],
    "Shopping": ["Clothing", "Electronics", "Online order", "Household items"],
    "Healthcare": ["Pharmacy", "Doctor visit", "Health insurance", "Dental"],
    "Education": ["Online course", "Books", "Tuition payment"],
    "Utilities": ["Electric bill", "Water bill", "Internet bill", "Phone bill"],
    "Debt Payments": ["Credit card payment", "Loan payment"],
    "Savings": ["Transfer to savings", "Investment contribution"],
    "Other": ["Miscellaneous", "Subscription", "Pet supplies"],
}


def seed_users(conn):
    """Return the existing target account; never create additional demo users."""
    cur = conn.cursor()
    cur.execute("SELECT id FROM identity.user_profiles WHERE email=%s", (TARGET_EMAIL,))
    row = cur.fetchone()
    if row is None:
        raise RuntimeError(f"Target account {TARGET_EMAIL} does not exist in Supabase")
    return [str(row[0])]


def seed_transactions(conn, user_ids, cat_ids, total=TARGET_TRANSACTION_COUNT):
    user_id = user_ids[0]
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM transactions WHERE user_id=%s", (user_id,))
    current_count = cur.fetchone()[0]
    cur.execute(
        "SELECT COUNT(*) FROM transactions WHERE user_id=%s AND id=%s",
        (user_id, ONE_OFF_SAMPLE_TRANSACTION_ID),
    )
    one_off_count = cur.fetchone()[0]
    retained_count = current_count - one_off_count
    if retained_count > total:
        raise RuntimeError(
            f"{TARGET_EMAIL} already has {retained_count} non-sample transactions; "
            f"refusing to delete user data to force the total down to {total}"
        )

    # Replace the prior aggregate-amount example with individual transaction rows.
    cur.execute(
        "DELETE FROM transactions WHERE user_id=%s AND id=%s",
        (user_id, ONE_OFF_SAMPLE_TRANSACTION_ID),
    )
    conn.commit()
    remaining = total - retained_count

    rng = random.Random(42)
    today = datetime.date.today()
    expense_cats = [(n, lo, hi) for n, (lo, hi) in EXPENSE_CATEGORIES if n in cat_ids]
    income_cats = [(n, lo, hi) for n, (lo, hi) in INCOME_CATEGORIES if n in cat_ids]
    if not expense_cats or not income_cats:
        raise RuntimeError("Expected seeded income and expense categories are missing")

    batch, count = [], 0
    for _ in range(remaining):
        is_income = rng.random() < 0.22
        name, lo, hi = rng.choice(income_cats if is_income else expense_cats)
        amount = round(rng.uniform(lo, hi), 2)
        day = today - datetime.timedelta(days=rng.randint(0, 365))
        created_at = datetime.datetime.combine(
            day, datetime.time(rng.randint(0, 23), rng.randint(0, 59))
        )
        description = f"Sample data: {rng.choice(DESCRIPTIONS.get(name, ['Transaction']))}"
        batch.append((
            str(uuid.uuid4()), user_id, "INCOME" if is_income else "EXPENSE",
            amount, name, cat_ids[name], day, description, None, None, created_at,
        ))
        count += 1
        if len(batch) >= 2000:
            _flush(cur, batch)
            conn.commit()
            batch.clear()
            print(f"  inserted {count}/{remaining} new rows")
    if batch:
        _flush(cur, batch)
        conn.commit()
    print(f"Added {count} rows; target total is {total} for {TARGET_EMAIL}")


def _flush(cur, batch):
    execute_values(
        cur,
        """INSERT INTO transactions
           (id,user_id,type,amount,category_name,category_id,date,description,account_id,card_id,created_at)
           VALUES %s""",
        batch,
        page_size=1000,
    )


def main():
    dsn = os.environ.get("SUPABASE_DATABASE_URL")
    if dsn:
        conn = psycopg2.connect(dsn, sslmode="require")
    else:
        env_path = ROOT / ".env"
        if not env_path.is_file():
            raise SystemExit("Set SUPABASE_DATABASE_URL or provide APP_DB_* values in .env")
        values = {}
        for raw in env_path.read_text().splitlines():
            line = raw.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                values[key] = value
        required = ("APP_DB_HOST", "APP_DB_PORT", "APP_DB_NAME", "APP_DB_USERNAME", "APP_DB_PASSWORD")
        if any(key not in values for key in required):
            raise SystemExit(".env is missing one or more APP_DB_* connection settings")
        conn = psycopg2.connect(
            host=values["APP_DB_HOST"], port=values["APP_DB_PORT"],
            dbname=values["APP_DB_NAME"], user=values["APP_DB_USERNAME"],
            password=values["APP_DB_PASSWORD"], sslmode="require",
        )

    conn.autocommit = False
    try:
        apply_migrations(conn)
        user_ids = seed_users(conn)
        cur = conn.cursor()
        cur.execute("SELECT name, id FROM categories")
        cat_ids = {name: category_id for name, category_id in cur.fetchall()}
        seed_transactions(conn, user_ids, cat_ids)
        cur.execute("SELECT COUNT(*) FROM transactions WHERE user_id=%s", (user_ids[0],))
        actual_count = cur.fetchone()[0]
        if actual_count != TARGET_TRANSACTION_COUNT:
            raise RuntimeError(f"Expected {TARGET_TRANSACTION_COUNT} rows; found {actual_count}")
        print(f"Verified transaction total for {TARGET_EMAIL}: {actual_count}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
