#!/usr/bin/env python3
"""
Load generated test data directly into PostgreSQL database.

Loads (in dependency order):
  - account.accounts
  - account.cards            (FK -> accounts)
  - transactions             (public; category_id resolved from categories table)
  - budget.budgets
  - debt.debts
  - debt.debt_payments       (FK -> debts)

Usage:
  python3 load_data_direct.py                 # uses/creates test@example.com via auth API
  python3 load_data_direct.py --user-id UUID  # attach data to an existing user
  python3 load_data_direct.py --file-dir DIR  # directory containing the JSON files

Requires the auth service to be reachable at AUTH_URL (default http://localhost:8080/api/auth)
so the test user can actually log in. Password for the test user: TestPassword123!
"""

import argparse
import json
import os
import sys
import time
import uuid
from datetime import datetime

import psycopg2
import requests
from psycopg2.extras import execute_values

DB_CONFIG = {
    # On machines with a local Postgres also bound to localhost:5432, use the
    # Docker-published address instead (e.g. the host's LAN IP) or set DB_HOST.
    'host': os.environ.get('DB_HOST', 'localhost'),
    'port': int(os.environ.get('DB_PORT', '5432')),
    'database': 'finance_tracker',
    'user': 'finance_user',
    'password': 'finance_password'
}

AUTH_URL = os.environ.get('AUTH_URL', 'http://localhost:8080/api/auth')
TEST_EMAIL = 'test@example.com'
TEST_PASSWORD = 'password123'  # matches the seeded demo user

BATCH_SIZE = 2000


def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        return conn
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        return None


def ensure_test_user():
    """Register or log in via the auth API so the user can sign in normally."""
    try:
        resp = requests.post(f"{AUTH_URL}/register", json={
            'email': TEST_EMAIL,
            'password': TEST_PASSWORD,
            'preferredCurrency': 'USD'
        }, timeout=10)
        if resp.status_code in (200, 201):
            data = resp.json()
            print(f"Registered test user {TEST_EMAIL} (id={data.get('userId')})")
            return data.get('userId') or data.get('id')
        if resp.status_code in (400, 409):
            pass  # already exists -> try login
    except requests.RequestException as e:
        print(f"Auth API unreachable ({e}); falling back to DB user lookup")

    try:
        resp = requests.post(f"{AUTH_URL}/login", json={
            'email': TEST_EMAIL,
            'password': TEST_PASSWORD
        }, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        print(f"Logged in as test user {TEST_EMAIL} (id={data.get('userId')})")
        return data.get('userId') or data.get('id')
    except Exception as e:
        print(f"Could not resolve test user via auth API: {e}")
        return None


def find_user_by_email(conn, email):
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM auth.user_profiles WHERE email = %s", (email,))
        row = cur.fetchone()
        return str(row[0]) if row else None


def resolve_user_id(conn, cli_user_id):
    if cli_user_id:
        return cli_user_id
    user_id = ensure_test_user()
    if user_id:
        return user_id
    # Fallback: look the user up directly in the DB
    user_id = find_user_by_email(conn, TEST_EMAIL)
    if user_id:
        print(f"Using existing DB user {TEST_EMAIL} (id={user_id}) - login may not work")
        return user_id
    print("No usable user found. Start the auth service or pass --user-id.")
    return None


def load_json(file_dir, name):
    path = os.path.join(file_dir, name)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        data = json.load(f)
    print(f"Loaded {len(data):,} records from {name}")
    return data


def ts(value):
    """Parse ISO timestamp/date string -> datetime for TIMESTAMP columns."""
    if not value:
        return datetime.now()
    try:
        return datetime.fromisoformat(str(value).replace('Z', '+00:00')).replace(tzinfo=None)
    except ValueError:
        return datetime.now()


def batched(iterable, n):
    for i in range(0, len(iterable), n):
        yield iterable[i:i + n]


def insert_batch(conn, table, columns, rows):
    sql = f"INSERT INTO {table} ({', '.join(columns)}) VALUES %s"
    with conn.cursor() as cur:
        execute_values(cur, sql, rows, page_size=BATCH_SIZE)
    conn.commit()


def load_accounts(conn, user_id, accounts):
    rows = [
        (a['id'], user_id, a['name'], a.get('institution'), a['accountType'],
         a.get('currency') or 'USD', a['currentBalance'], a.get('isActive', True),
         ts(a.get('createdAt')), ts(a.get('updatedAt')))
        for a in accounts
    ]
    start = time.time()
    for batch in batched(rows, BATCH_SIZE):
        insert_batch(conn, 'account.accounts',
                     ['id', 'user_id', 'name', 'institution', 'account_type', 'currency',
                      'current_balance', 'is_active', 'created_at', 'updated_at'], batch)
    print(f"accounts: {len(rows):,} rows in {time.time() - start:.1f}s")
    return {a['id'] for a in accounts}


def load_cards(conn, user_id, cards, valid_account_ids):
    rows = []
    for c in cards:
        account_id = c.get('accountId')
        if account_id and account_id not in valid_account_ids:
            account_id = None  # avoid FK violation
        rows.append((
            c['id'], user_id, account_id, c['name'], c['cardType'],
            c.get('lastFour'), c.get('network'), c.get('creditLimit'),
            c.get('currentBalance', 0), c.get('apr'),
            c.get('expiryMonth'), c.get('expiryYear'), c.get('isActive', True),
            ts(c.get('createdAt')), ts(c.get('updatedAt'))
        ))
    start = time.time()
    for batch in batched(rows, BATCH_SIZE):
        insert_batch(conn, 'account.cards',
                     ['id', 'user_id', 'account_id', 'name', 'card_type', 'last_four',
                      'network', 'credit_limit', 'current_balance', 'apr',
                      'expiry_month', 'expiry_year', 'is_active', 'created_at', 'updated_at'],
                     batch)
    print(f"cards: {len(rows):,} rows in {time.time() - start:.1f}s")
    return {c['id'] for c in cards}


def load_category_map(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT id, name FROM categories")
        return {name: str(cid) for cid, name in cur.fetchall()}


def load_transactions(conn, user_id, transactions, category_map, valid_account_ids, valid_card_ids):
    rows = []
    for t in transactions:
        account_id = t.get('accountId')
        if account_id and account_id not in valid_account_ids:
            account_id = None
        card_id = t.get('cardId')
        if card_id and card_id not in valid_card_ids:
            card_id = None
        rows.append((
            t['id'], user_id, t['type'], t['amount'],
            category_map.get(t.get('category')), t.get('category'),
            t.get('date'), t.get('description'),
            account_id, card_id, ts(t.get('createdAt'))
        ))
    start = time.time()
    for batch in batched(rows, BATCH_SIZE):
        insert_batch(conn, 'transactions',
                     ['id', 'user_id', 'type', 'amount', 'category_id', 'category_name',
                      'date', 'description', 'account_id', 'card_id', 'created_at'], batch)
    print(f"transactions: {len(rows):,} rows in {time.time() - start:.1f}s")


def load_budgets(conn, user_id, budgets):
    rows = [
        (b['id'], user_id, b['category'], b['month'], b['year'], b['spendingLimit'],
         ts(b.get('createdAt')), ts(b.get('updatedAt')))
        for b in budgets
    ]
    start = time.time()
    for batch in batched(rows, BATCH_SIZE):
        insert_batch(conn, 'budget.budgets',
                     ['id', 'user_id', 'category', 'month', 'year', 'spending_limit',
                      'created_at', 'updated_at'], batch)
    print(f"budgets: {len(rows):,} rows in {time.time() - start:.1f}s")


def load_debts(conn, user_id, debts):
    rows = [
        (d['id'], user_id, d['name'], d['originalBalance'], d['currentBalance'],
         d['apr'], d.get('minimumPayment', 0), d['dueDate'],
         ts(d.get('createdAt')), ts(d.get('updatedAt')))
        for d in debts
    ]
    start = time.time()
    for batch in batched(rows, BATCH_SIZE):
        insert_batch(conn, 'debt.debts',
                     ['id', 'user_id', 'name', 'original_balance', 'current_balance', 'apr',
                      'minimum_payment', 'due_date', 'created_at', 'updated_at'], batch)
    print(f"debts: {len(rows):,} rows in {time.time() - start:.1f}s")
    return {d['id'] for d in debts}


def load_debt_payments(conn, user_id, payments, valid_debt_ids):
    rows = []
    for p in payments:
        if p.get('debtId') not in valid_debt_ids:
            continue
        pay_date = p.get('paymentDate')
        rows.append((
            p['id'], user_id, p['debtId'], p['amount'],
            pay_date if isinstance(pay_date, str) else str(pay_date),
            p.get('note'), ts(p.get('createdAt'))
        ))
    start = time.time()
    for batch in batched(rows, BATCH_SIZE):
        insert_batch(conn, 'debt.debt_payments',
                     ['id', 'user_id', 'debt_id', 'amount', 'payment_date', 'note', 'created_at'],
                     batch)
    print(f"debt_payments: {len(rows):,} rows in {time.time() - start:.1f}s")


def main():
    parser = argparse.ArgumentParser(description='Load generated test data into PostgreSQL')
    parser.add_argument('--user-id', help='Existing user UUID to attach data to')
    parser.add_argument('--file-dir', default='.', help='Directory with generated JSON files')
    args = parser.parse_args()

    print("=== Loading Test Data Directly into PostgreSQL ===")
    print(f"Timestamp: {datetime.now()}\n")

    conn = get_db_connection()
    if not conn:
        print("Cannot proceed without database connection")
        sys.exit(1)
    print("Connected to database")

    user_id = resolve_user_id(conn, args.user_id)
    if not user_id:
        conn.close()
        sys.exit(1)
    print(f"Using user_id: {user_id}")

    data = {
        'accounts': load_json(args.file_dir, 'accounts.json'),
        'cards': load_json(args.file_dir, 'cards.json'),
        'transactions': load_json(args.file_dir, 'transactions.json'),
        'budgets': load_json(args.file_dir, 'budgets.json'),
        'debts': load_json(args.file_dir, 'debts.json'),
        'debt_payments': load_json(args.file_dir, 'debt_payments.json'),
    }
    missing = [k for k, v in data.items() if v is None]
    if missing:
        print(f"Missing files: {', '.join(missing)} - run generate_test_data.py first")
        conn.close()
        sys.exit(1)

    print("\n=== Loading Data ===")
    start = time.time()

    valid_accounts = load_accounts(conn, user_id, data['accounts'])
    valid_cards = load_cards(conn, user_id, data['cards'], valid_accounts)
    category_map = load_category_map(conn)
    print(f"Resolved {len(category_map)} categories")
    load_transactions(conn, user_id, data['transactions'], category_map,
                      valid_accounts, valid_cards)
    load_budgets(conn, user_id, data['budgets'])
    valid_debts = load_debts(conn, user_id, data['debts'])
    load_debt_payments(conn, user_id, data['debt_payments'], valid_debts)

    print(f"\nDone in {time.time() - start:.1f}s")
    conn.close()


if __name__ == '__main__':
    main()
