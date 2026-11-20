#!/usr/bin/env python3
"""Migrate the personal-finance schema to Supabase Postgres and seed demo data.

Applies every service's Flyway migrations (in order) against a Supabase
Postgres database and records them in flyway_schema_history so the services'
own Flyway instances see them as already applied. Then seeds users and
~50k transactions plus supporting accounts/cards/budgets/debts.

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
    installed_on TIMESTAMP NOT NULL,
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


BCRYPT_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"  # password123

NEW_USERS = [
    ("emma@example.com", "Emma", "USD"),
    ("liam@example.com", "Liam", "USD"),
    ("olivia@example.com", "Olivia", "EUR"),
    ("noah@example.com", "Noah", "USD"),
]

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
    cur = conn.cursor()
    user_ids = []
    now = datetime.datetime.now()
    for email, _, currency in NEW_USERS:
        uid = str(uuid.uuid4())
        cur.execute(
            """INSERT INTO identity.user_profiles
               (id, email, password, preferred_currency, created_at, updated_at)
               VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT (email) DO NOTHING""",
            (uid, email, BCRYPT_HASH, currency, now, now),
        )
        cur.execute("SELECT id FROM identity.user_profiles WHERE email=%s", (email,))
        user_ids.append(str(cur.fetchone()[0]))
    conn.commit()
    return user_ids


def seed_supporting_data(conn, user_ids):
    cur = conn.cursor()
    now = datetime.datetime.now()
    cur.execute("SELECT name, id FROM categories")
    cat_ids = {name: str(cid) for name, cid in cur.fetchall()}

    accounts, cards = {}, {}
    for uid in user_ids:
        acc_checking, acc_savings = str(uuid.uuid4()), str(uuid.uuid4())
        cur.execute(
            """INSERT INTO account.accounts
               (id,user_id,name,institution,account_type,currency,current_balance,is_active,created_at,updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,true,%s,%s)""",
            (acc_checking, uid, "Everyday Checking", "Chase", "CHECKING", "USD", 4200.00, now, now),
        )
        cur.execute(
            """INSERT INTO account.accounts
               (id,user_id,name,institution,account_type,currency,current_balance,is_active,created_at,updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,true,%s,%s)""",
            (acc_savings, uid, "High-Yield Savings", "Ally", "SAVINGS", "USD", 18500.00, now, now),
        )
        card1, card2 = str(uuid.uuid4()), str(uuid.uuid4())
        cur.execute(
            """INSERT INTO account.cards
               (id,user_id,account_id,name,card_type,last_four,network,credit_limit,current_balance,apr,
                expiry_month,expiry_year,is_active,created_at,updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,true,%s,%s)""",
            (card1, uid, acc_checking, "Platinum Rewards", "CREDIT", "4821", "VISA",
             10000.00, 1240.55, 21.99, 8, 2028, now, now),
        )
        cur.execute(
            """INSERT INTO account.cards
               (id,user_id,account_id,name,card_type,last_four,network,current_balance,is_active,created_at,updated_at)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,true,%s,%s)""",
            (card2, uid, acc_checking, "Everyday Debit", "DEBIT", "9034", "MASTERCARD",
             -85.20, now, now),
        )
        accounts[uid] = [acc_checking, acc_savings]
        cards[uid] = [card1, card2]

        month, year = now.month, now.year
        for cat, limit in [
            ("Housing", 1800), ("Food & Dining", 600), ("Transportation", 250),
            ("Entertainment", 200), ("Shopping", 300), ("Utilities", 300),
            ("Healthcare", 200), ("Debt Payments", 500),
        ]:
            cur.execute(
                """INSERT INTO budget.budgets
                   (id,user_id,category,month,year,spending_limit,created_at,updated_at)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                (str(uuid.uuid4()), uid, cat, month, year, limit, now, now),
            )

        for name, orig, bal, apr, minpay in [
            ("Platinum Credit Card", 8000, 5240.55, 21.99, 180),
            ("Auto Loan", 22000, 14750.00, 5.9, 420),
        ]:
            did = str(uuid.uuid4())
            cur.execute(
                """INSERT INTO debt.debts
                   (id,user_id,name,original_balance,current_balance,apr,minimum_payment,due_date,created_at,updated_at)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (did, uid, name, orig, bal, apr, minpay,
                 (now + datetime.timedelta(days=random.randint(5, 25))).date(), now, now),
            )
            for _ in range(3):
                cur.execute(
                    """INSERT INTO debt.debt_payments
                       (id,user_id,debt_id,amount,payment_date,note,created_at)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                    (str(uuid.uuid4()), uid, did, minpay,
                     (now - datetime.timedelta(days=random.randint(30, 300))).date(),
                     "Monthly payment", now),
                )
    conn.commit()
    return cat_ids, accounts, cards


def seed_transactions(conn, user_ids, cat_ids, accounts, cards, total=50000):
    cur = conn.cursor()
    rng = random.Random(42)
    today = datetime.date.today()
    per_user = total // len(user_ids)
    expense_cats = [(n, lo, hi) for n, (lo, hi) in EXPENSE_CATEGORIES]
    income_cats = [(n, lo, hi) for n, (lo, hi) in INCOME_CATEGORIES]

    batch, count = [], 0
    for uid in user_ids:
        for _ in range(per_user):
            is_income = rng.random() < 0.22
            name, lo, hi = rng.choice(income_cats if is_income else expense_cats)
            amount = round(rng.uniform(lo, hi), 2)
            days_ago = rng.randint(0, 365)
            d = today - datetime.timedelta(days=days_ago)
            ts = datetime.datetime.combine(d, datetime.time(rng.randint(0, 23), rng.randint(0, 59)))
            desc = rng.choice(DESCRIPTIONS.get(name, ["Transaction"]))
            acc = rng.choice(accounts[uid]) if rng.random() < 0.8 else None
            crd = rng.choice(cards[uid]) if (not is_income and rng.random() < 0.45) else None
            batch.append((
                str(uuid.uuid4()), uid,
                "INCOME" if is_income else "EXPENSE",
                amount, name, cat_ids.get(name), d, desc, acc, crd, ts,
            ))
            count += 1
            if len(batch) >= 2000:
                _flush(cur, batch); conn.commit(); batch.clear()
                print(f"  inserted {count}/{total}")
    if batch:
        _flush(cur, batch); conn.commit()
    print(f"Done: {count} transactions")


def _flush(cur, batch):
    execute_values(
        cur,
        """INSERT INTO transactions
           (id,user_id,type,amount,category_name,category_id,date,description,account_id,card_id,created_at)
           VALUES %s""",
        batch,
        page_size=1000,
    )


def seed_snapshots(conn, user_ids):
    cur = conn.cursor()
    today = datetime.date.today()
    months = []
    y, m = today.year, today.month
    for _ in range(12):
        months.append((m, y))
        m -= 1
        if m == 0:
            m, y = 12, y - 1
    for uid in user_ids:
        for month, year in months:
            cur.execute(
                """INSERT INTO dashboard.dashboard_snapshots
                   (id,user_id,month,year,income_total,expense_total,outstanding_debt,generated_at)
                   SELECT gen_random_uuid(), %s, %s, %s,
                          COALESCE(SUM(amount) FILTER (WHERE type='INCOME'),0),
                          COALESCE(SUM(amount) FILTER (WHERE type='EXPENSE'),0),
                          (SELECT COALESCE(SUM(current_balance),0) FROM debt.debts WHERE user_id=%s),
                          NOW()
                   FROM transactions
                   WHERE user_id=%s
                     AND EXTRACT(MONTH FROM date)=%s AND EXTRACT(YEAR FROM date)=%s""",
                (uid, month, year, uid, uid, month, year),
            )
    conn.commit()
    print("dashboard snapshots seeded")


def main():
    dsn = os.environ.get("SUPABASE_DATABASE_URL")
    if not dsn:
        raise SystemExit("Set SUPABASE_DATABASE_URL (postgresql://...)")
    conn = psycopg2.connect(dsn, sslmode="require")
    conn.autocommit = False
    try:
        apply_migrations(conn)
        cur = conn.cursor()
        cur.execute("""
            CREATE SCHEMA IF NOT EXISTS agent;
            CREATE TABLE IF NOT EXISTS agent.savings_goals (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                target_amount NUMERIC(15,2) NOT NULL,
                current_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
                target_date DATE,
                created_at TIMESTAMP NOT NULL DEFAULT now()
            );
            CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON agent.savings_goals(user_id);
        """)
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM transactions")
        already_seeded = cur.fetchone()[0] > 1000
        if already_seeded:
            print("transactions already seeded — skipping data seed")
            return
        user_ids = seed_users(conn)
        print(f"users: {user_ids}")
        cat_ids, accounts, cards = seed_supporting_data(conn, user_ids)
        seed_transactions(conn, user_ids, cat_ids, accounts, cards)
        seed_snapshots(conn, user_ids)
        cur = conn.cursor()
        for t in ["transactions", "categories"]:
            cur.execute(f"SELECT COUNT(*) FROM {t}")
            print(f"public.{t}: {cur.fetchone()[0]} rows")
        for s in ["identity.user_profiles", "account.accounts", "account.cards",
                  "budget.budgets", "debt.debts", "debt.debt_payments",
                  "dashboard.dashboard_snapshots"]:
            cur.execute(f"SELECT COUNT(*) FROM {s}")
            print(f"{s}: {cur.fetchone()[0]} rows")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
