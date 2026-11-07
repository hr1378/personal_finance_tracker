#!/usr/bin/env python3
"""
Load generated test data into the database via the API gateway.

Loads accounts, cards, debts (+ payments) first so that transactions can be
linked to real server-side account/card IDs (generated IDs are remapped).

NOTE: this is the slow path (~1 request per record). For large datasets use
load_data_direct.py instead, which bulk-inserts straight into PostgreSQL.
"""

import json
import os
import time
from datetime import datetime

import requests

# Configuration
API_BASE_URL = os.environ.get('API_BASE_URL', 'http://localhost:8080/api')
BATCH_SIZE = 100  # Process in batches to avoid overwhelming the server
FILE_DIR = os.environ.get('DATA_DIR', '.')


def register_user():
    """Register a test user"""
    user_data = {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "preferredCurrency": "USD"
    }

    try:
        response = requests.post(f"{API_BASE_URL}/auth/register", json=user_data)
        if response.status_code == 201:
            print("User registered successfully")
            return response.json()
        elif response.status_code == 409:
            print("User already exists, logging in...")
            return login_user(user_data)
        else:
            print(f"Failed to register user: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error registering user: {e}")
        return None


def login_user(user_data):
    """Login and get token"""
    try:
        response = requests.post(f"{API_BASE_URL}/auth/login", json=user_data)
        if response.status_code == 200:
            print("User logged in successfully")
            return response.json()
        else:
            print(f"Failed to login: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error logging in: {e}")
        return None


def post_all(token, endpoint, items, label, delay=0.05, id_key='id'):
    """POST each item; return {generated_id: server_id} for successfully created rows."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    id_map = {}
    success_count = 0
    error_count = 0

    print(f"\nLoading {len(items)} {label}...")

    for i, item in enumerate(items):
        try:
            response = requests.post(f"{API_BASE_URL}/{endpoint}", json=item, headers=headers)
            if response.status_code in (200, 201):
                success_count += 1
                server_id = response.json().get(id_key)
                if server_id and item.get(id_key):
                    id_map[item[id_key]] = server_id
            else:
                error_count += 1
                if error_count <= 5:
                    print(f"  Failed to load {label}: {response.status_code} {response.text[:120]}")
        except Exception as e:
            error_count += 1
            if error_count <= 5:
                print(f"  Error loading {label}: {e}")

        if (i + 1) % 1000 == 0:
            print(f"  Progress: {i + 1}/{len(items)}")
        time.sleep(delay)

    print(f"{label.capitalize()} loaded: {success_count}, failed: {error_count}")
    return id_map


def load_accounts(token, accounts):
    """Create accounts; returns {generated_id: server_id}."""
    return post_all(token, 'accounts', accounts, 'accounts', delay=0.02)


def load_cards(token, cards, account_map):
    """Create cards with remapped accountId; returns {generated_id: server_id}."""
    for card in cards:
        gen_id = card.get('accountId')
        card['accountId'] = account_map.get(gen_id) if gen_id else None
    return post_all(token, 'cards', cards, 'cards', delay=0.02)


def load_debts(token, debts):
    """Create debts; returns {generated_id: server_id}."""
    return post_all(token, 'debts', debts, 'debts', delay=0.02)


def load_debt_payments(token, payments, debt_map):
    """Create debt payments against server-side debt IDs."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    success_count = 0
    error_count = 0
    skipped = 0

    print(f"\nLoading {len(payments)} debt payments...")

    for i, payment in enumerate(payments):
        server_debt_id = debt_map.get(payment.get('debtId'))
        if not server_debt_id:
            skipped += 1
            continue
        payload = {
            'userId': payment.get('userId'),
            'debtId': server_debt_id,
            'amount': payment['amount'],
            'paymentDate': payment['paymentDate'],
            'note': payment.get('note')
        }
        try:
            response = requests.post(
                f"{API_BASE_URL}/debts/{server_debt_id}/payments",
                json=payload, headers=headers)
            if response.status_code in (200, 201):
                success_count += 1
            else:
                error_count += 1
                if error_count <= 5:
                    print(f"  Failed payment: {response.status_code} {response.text[:120]}")
        except Exception as e:
            error_count += 1
            if error_count <= 5:
                print(f"  Error payment: {e}")

        if (i + 1) % 1000 == 0:
            print(f"  Progress: {i + 1}/{len(payments)}")
        time.sleep(0.02)

    print(f"Debt payments loaded: {success_count}, failed: {error_count}, skipped: {skipped}")


def load_budgets(token, budgets):
    """Load budgets"""
    post_all(token, 'budgets', budgets, 'budgets', delay=0.02)


def load_transactions(token, transactions, account_map, card_map):
    """Load transactions with remapped account/card IDs."""
    for tx in transactions:
        gen_account = tx.get('accountId')
        gen_card = tx.get('cardId')
        tx['accountId'] = account_map.get(gen_account) if gen_account else None
        tx['cardId'] = card_map.get(gen_card) if gen_card else None
    post_all(token, 'transactions', transactions, 'transactions', delay=0.02)


def load_json(name):
    path = os.path.join(FILE_DIR, name)
    if not os.path.exists(path):
        return None
    with open(path, 'r') as f:
        data = json.load(f)
    print(f"Loaded {len(data)} records from {name}")
    return data


def main():
    print("=== Loading Test Data into Database via API ===")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Timestamp: {datetime.now()}\n")

    accounts = load_json('accounts.json')
    cards = load_json('cards.json')
    transactions = load_json('transactions.json')
    budgets = load_json('budgets.json')
    debts = load_json('debts.json')
    payments = load_json('debt_payments.json')

    # Register/Login user
    print("\n=== Authentication ===")
    auth_response = register_user()

    if not auth_response or 'token' not in auth_response:
        print("Failed to authenticate. Cannot proceed.")
        return

    token = auth_response['token']
    print(f"Token obtained: {token[:20]}...")

    # Load data in dependency order
    print("\n=== Loading Data ===")
    start_time = time.time()

    account_map = load_accounts(token, accounts) if accounts else {}
    card_map = load_cards(token, cards, account_map) if cards else {}
    debt_map = load_debts(token, debts) if debts else {}
    if payments:
        load_debt_payments(token, payments, debt_map)
    load_budgets(token, budgets) if budgets else None
    if transactions:
        load_transactions(token, transactions, account_map, card_map)

    elapsed_time = time.time() - start_time
    print(f"\nData loading complete in {elapsed_time:.2f} seconds")


if __name__ == '__main__':
    main()
