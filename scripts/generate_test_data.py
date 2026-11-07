#!/usr/bin/env python3
"""
Generate ~100k test records for the personal finance tracker.

Distributes records across all tables:
  - transactions.json    (~50k, linked to accounts/cards, multi-month, edge cases)
  - budgets.json         (~12k, across many months/years)
  - debts.json           (~8k)
  - debt_payments.json   (~10k)
  - accounts.json        (~12k bank accounts)
  - cards.json           (~8k credit/debit cards)

Dates span a rolling 24-month window ending today so data covers
multiple months/years. Edge cases include: very large/small amounts,
negative account balances, over-limit cards, expired cards, inactive
records, missing optional fields, zero APR, fully/partially paid debts.
"""

import random
import uuid
import json
from datetime import datetime, timedelta
from decimal import Decimal

# ---------------- Configuration ----------------
NUM_TRANSACTIONS = 50_000
NUM_BUDGETS = 12_000
NUM_DEBTS = 8_000
NUM_DEBT_PAYMENTS = 10_000
NUM_ACCOUNTS = 12_000
NUM_CARDS = 8_000

# Rolling 24-month window ending today -> data spans multiple months/years
END_DATE = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
START_DATE = END_DATE - timedelta(days=730)

USER_ID = str(uuid.uuid4())

# Categories match the seeded categories in transaction-service (V4 migration)
INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gifts']
EXPENSE_CATEGORIES = [
    'Food & Dining', 'Transportation', 'Housing', 'Entertainment',
    'Shopping', 'Healthcare', 'Education', 'Utilities',
    'Debt Payments', 'Savings', 'Other'
]

ACCOUNT_NAMES = [
    'Everyday Checking', 'High-Yield Savings', 'Money Market',
    'Joint Checking', 'Emergency Fund', 'Vacation Savings',
    'Business Checking', 'Kids Savings', 'Primary Checking',
    'Secondary Savings', 'CD Account', 'Brokerage Cash'
]

INSTITUTIONS = [
    'Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One',
    'Fidelity', 'Schwab', 'Marcus', 'Ally', 'Discover', 'US Bank', 'PNC',
    'TD Bank', 'Regions', 'KeyBank', None  # None -> missing institution edge case
]

ACCOUNT_TYPES = ['CHECKING', 'SAVINGS', 'MONEY_MARKET']
CURRENCIES = ['USD', 'USD', 'USD', 'USD', 'EUR', 'GBP']  # Mostly USD, some foreign

CARD_NAMES = [
    'Rewards Card', 'Cash Back Card', 'Travel Card', 'Business Card',
    'Student Card', 'Secured Card', 'Premium Card', 'Everyday Card',
    'Gas Card', 'Store Card', 'Debit Card', 'ATM Card'
]

CARD_NETWORKS = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'OTHER']
DEBT_NAMES = [
    'Credit Card', 'Student Loan', 'Car Loan', 'Mortgage',
    'Personal Loan', 'Medical Bill', 'Business Loan', 'Line of Credit'
]


def random_datetime(start, end):
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))


def random_date(start, end):
    # Accepts date or datetime; returns a date
    start_d = start.date() if isinstance(start, datetime) else start
    end_d = end.date() if isinstance(end, datetime) else end
    delta = max((end_d - start_d).days, 0)
    return start_d + timedelta(days=random.randint(0, delta))


def money(lo, hi):
    return float(Decimal(str(random.uniform(lo, hi))).quantize(Decimal('0.01')))


def generate_accounts():
    accounts = []
    for _ in range(NUM_ACCOUNTS):
        created = random_datetime(START_DATE, END_DATE)
        r = random.random()
        if r < 0.03:        # 3% negative balance (overdraft)
            balance = money(-5000, -0.01)
        elif r < 0.06:      # 3% zero balance
            balance = 0.0
        elif r < 0.09:      # 3% very large balance
            balance = money(250000, 2000000)
        else:
            balance = money(0, 50000)

        # ~8% inactive accounts
        is_active = random.random() > 0.08

        accounts.append({
            'id': str(uuid.uuid4()),
            'userId': USER_ID,
            'name': random.choice(ACCOUNT_NAMES) + f' #{len(accounts) + 1}',
            'institution': random.choice(INSTITUTIONS),
            'accountType': random.choice(ACCOUNT_TYPES),
            'currency': random.choice(CURRENCIES),
            'currentBalance': balance,
            'isActive': is_active,
            'createdAt': created.isoformat(),
            'updatedAt': (created + timedelta(days=random.randint(0, 365))).isoformat()
        })
    return accounts


def generate_cards(accounts):
    cards = []
    account_ids = [a['id'] for a in accounts]
    today = datetime.now()
    for _ in range(NUM_CARDS):
        created = random_datetime(START_DATE, END_DATE)
        card_type = 'CREDIT' if random.random() < 0.75 else 'DEBIT'
        r = random.random()

        # ~70% of cards linked to an account
        account_id = random.choice(account_ids) if account_ids and random.random() < 0.7 else None

        # Credit limit / balance edge cases
        credit_limit = None
        if card_type == 'CREDIT':
            if r < 0.05:
                credit_limit = 0.0                     # zero-limit edge case
            elif r < 0.10:
                credit_limit = money(500, 1500)        # very low limit
            else:
                credit_limit = money(1000, 50000)

        if card_type == 'CREDIT' and credit_limit:
            if r < 0.04:
                balance = money(credit_limit, credit_limit * 1.5)  # over-limit!
            elif r < 0.15:
                balance = 0.0                                    # paid off
            else:
                balance = money(0, credit_limit * 0.9)
        elif card_type == 'DEBIT':
            balance = money(-2000, 25000)   # debit can go negative (overdraft)
        else:
            balance = 0.0

        # APR edge cases: 0%, very high, normal, or missing
        if card_type == 'CREDIT':
            ar = random.random()
            if ar < 0.05:
                apr = 0.0
            elif ar < 0.10:
                apr = money(25, 35)
            elif ar < 0.15:
                apr = None
            else:
                apr = round(random.uniform(5, 24), 2)
        else:
            apr = None

        # Expiry: some expired, some expiring soon, some far future, some missing
        er = random.random()
        if er < 0.08:
            expiry_month, expiry_year = None, None
        elif er < 0.15:
            # expired within last 18 months
            months_ago = random.randint(1, 18)
            total = today.year * 12 + today.month - 1 - months_ago
            expiry_year, expiry_month = total // 12, total % 12 + 1
        elif er < 0.22:
            # expiring within next 6 months
            months_ahead = random.randint(1, 6)
            total = today.year * 12 + today.month - 1 + months_ahead
            expiry_year, expiry_month = total // 12, total % 12 + 1
        else:
            expiry_year = today.year + random.randint(1, 5)
            expiry_month = random.randint(1, 12)

        cards.append({
            'id': str(uuid.uuid4()),
            'userId': USER_ID,
            'accountId': account_id,
            'name': random.choice(CARD_NAMES) + f' #{len(cards) + 1}',
            'cardType': card_type,
            'lastFour': f'{random.randint(0, 9999):04d}' if random.random() > 0.1 else None,
            'network': random.choice(CARD_NETWORKS) if random.random() > 0.08 else None,
            'creditLimit': credit_limit,
            'currentBalance': round(balance, 2),
            'apr': apr,
            'expiryMonth': expiry_month,
            'expiryYear': expiry_year,
            'isActive': random.random() > 0.07,
            'createdAt': created.isoformat(),
            'updatedAt': (created + timedelta(days=random.randint(0, 365))).isoformat()
        })
    return cards


def generate_transactions(accounts, cards):
    account_ids = [a['id'] for a in accounts]
    card_ids = [c['id'] for c in cards]
    transactions = []
    days = (END_DATE - START_DATE).days

    for i in range(NUM_TRANSACTIONS):
        tx_date = START_DATE + timedelta(days=random.randint(0, days))
        created = random_datetime(tx_date, min(tx_date + timedelta(days=30), END_DATE))
        is_income = random.random() < 0.3

        if is_income:
            category = random.choice(INCOME_CATEGORIES)
            tx_type = 'INCOME'
            e = random.random()
            if e < 0.01:
                amount = money(50000, 100000)       # very large income
            elif e < 0.05:
                amount = money(5000, 20000)         # bonus
            elif e < 0.10:
                amount = money(0.01, 10)            # tiny income
            else:
                amount = money(1000, 10000)
        else:
            category = random.choice(EXPENSE_CATEGORIES)
            tx_type = 'EXPENSE'
            e = random.random()
            if e < 0.01:
                amount = money(10000, 50000)        # emergency expense
            elif e < 0.05:
                amount = money(2000, 10000)         # large purchase
            elif e < 0.10:
                amount = money(0.01, 5)             # tiny expense
            elif e < 0.15:
                amount = money(999.0, 1001.0)        # unusual .99-style amounts
            else:
                amount = money(10, 500)

        # ~85% linked to an account or card, ~15% unlinked
        account_id = card_id = None
        if random.random() < 0.85:
            if card_ids and (random.random() < 0.5 or not account_ids):
                card_id = random.choice(card_ids)
            elif account_ids:
                account_id = random.choice(account_ids)

        transactions.append({
            'id': str(uuid.uuid4()),
            'userId': USER_ID,
            'type': tx_type,
            'amount': amount,
            'category': category,
            'date': tx_date.strftime('%Y-%m-%d'),
            'description': f'{category} transaction #{i + 1}',
            'accountId': account_id,
            'cardId': card_id,
            'createdAt': created.isoformat()
        })
    return transactions


def generate_budgets():
    budgets = []
    # Spread across the same ~24 month window
    total_months = (END_DATE.year - START_DATE.year) * 12 + (END_DATE.month - START_DATE.month) + 1
    start_year, start_month = START_DATE.year, START_DATE.month

    for _ in range(NUM_BUDGETS):
        month_offset = random.randint(0, total_months - 1)
        m = start_month - 1 + month_offset
        year = start_year + m // 12
        month = m % 12 + 1

        category = random.choice(EXPENSE_CATEGORIES + ['Dining Out', 'Subscriptions', 'Travel'])

        r = random.random()
        if r < 0.05:
            limit = money(5000, 20000)     # very high budget
        elif r < 0.10:
            limit = money(10, 50)          # very low budget
        else:
            limit = money(200, 2000)

        budgets.append({
            'id': str(uuid.uuid4()),
            'userId': USER_ID,
            'category': category,
            'spendingLimit': limit,
            'month': month,
            'year': year,
            'createdAt': datetime(year, month, 1).isoformat(),
            'updatedAt': datetime(year, month, 1).isoformat()
        })
    return budgets


def generate_debts():
    debts = []
    debt_ids = []
    today = datetime.now().date()
    days = (END_DATE - START_DATE).days

    for i in range(NUM_DEBTS):
        created = START_DATE + timedelta(days=random.randint(0, days))
        debt_id = str(uuid.uuid4())
        debt_ids.append(debt_id)

        r = random.random()
        if r < 0.10:
            total = money(100000, 500000)    # very large debt
        elif r < 0.20:
            total = money(100, 1000)         # very small debt
        else:
            total = money(5000, 50000)

        paid_pct = random.uniform(0, 0.95)
        paid = round(total * paid_pct, 2)
        current = round(total - paid, 2)

        # APR edge cases: 0%, very high, normal
        ar = random.random()
        if ar < 0.08:
            apr = 0.0
        elif ar < 0.15:
            apr = round(random.uniform(20, 35), 2)
        else:
            apr = round(random.uniform(3, 18), 2)

        minimum = max(25.0, round(total * 0.03, 2))

        # Due dates: some overdue, some near, some far future
        dr = random.random()
        if dr < 0.20:
            due = today - timedelta(days=random.randint(1, 365))   # overdue
        elif dr < 0.50:
            due = today + timedelta(days=random.randint(1, 90))   # near
        else:
            due = today + timedelta(days=random.randint(90, 730)) # far

        debts.append({
            'id': debt_id,
            'userId': USER_ID,
            'name': random.choice(DEBT_NAMES) + f' #{i + 1}',
            'originalBalance': total,
            'currentBalance': current,
            'apr': apr,
            'minimumPayment': minimum,
            'dueDate': due.isoformat(),
            'paidAmount': paid,
            'createdAt': created.isoformat(),
            'updatedAt': (created + timedelta(days=random.randint(0, 365))).isoformat()
        })
    return debts


def generate_debt_payments(debts):
    payments = []
    for _ in range(NUM_DEBT_PAYMENTS):
        debt = random.choice(debts)
        # Payment date between debt creation and due date (or today if no due)
        try:
            created = datetime.fromisoformat(debt['createdAt'])
            due = datetime.fromisoformat(debt['dueDate'])
        except (ValueError, TypeError):
            created, due = START_DATE, END_DATE
        if due <= created:
            created, due = START_DATE, END_DATE
        pay_date = random_date(created.date(), min(due.date(), END_DATE.date()))

        # Amount: mostly minimum-ish, some large lump sums, some tiny
        r = random.random()
        if r < 0.05:
            amount = money(debt['originalBalance'] * 0.5, debt['originalBalance'])  # lump sum
        elif r < 0.10:
            amount = money(0.01, 5)                                            # tiny payment
        else:
            amount = money(debt['minimumPayment'] * 0.8, debt['minimumPayment'] * 2.5)

        payments.append({
            'id': str(uuid.uuid4()),
            'userId': USER_ID,
            'debtId': debt['id'],
            'amount': round(amount, 2),
            'paymentDate': pay_date.isoformat(),
            'note': random.choice([None, 'Monthly payment', 'Extra payment', 'Autopay', 'Wire transfer']),
            'createdAt': pay_date.isoformat()
        })
    return payments


def save_to_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f)
    print(f"Saved {len(data)} records to {filename}")


def main():
    print("Generating ~100k test records...")
    print(f"Date range: {START_DATE.date()} to {END_DATE.date()} (24 months)")
    print(f"User ID placeholder: {USER_ID}")

    print("Generating accounts...")
    accounts = generate_accounts()
    save_to_json(accounts, 'accounts.json')

    print("Generating cards...")
    cards = generate_cards(accounts)
    save_to_json(cards, 'cards.json')

    print("Generating transactions...")
    transactions = generate_transactions(accounts, cards)
    save_to_json(transactions, 'transactions.json')

    print("Generating budgets...")
    budgets = generate_budgets()
    save_to_json(budgets, 'budgets.json')

    print("Generating debts...")
    debts = generate_debts()
    save_to_json(debts, 'debts.json')

    print("Generating debt payments...")
    payments = generate_debt_payments(debts)
    save_to_json(payments, 'debt_payments.json')

    total = (len(transactions) + len(budgets) + len(debts) + len(payments)
             + len(accounts) + len(cards))
    print("\n=== Statistics ===")
    print(f"Total records: {total:,}")
    print(f"  transactions:    {len(transactions):,}")
    print(f"  budgets:         {len(budgets):,}")
    print(f"  debts:           {len(debts):,}")
    print(f"  debt_payments:   {len(payments):,}")
    print(f"  accounts:        {len(accounts):,}")
    print(f"  cards:           {len(cards):,}")
    linked = sum(1 for t in transactions if t['accountId'] or t['cardId'])
    print(f"\n  linked transactions: {linked:,} ({linked / len(transactions) * 100:.1f}%)")
    income = sum(1 for t in transactions if t['type'] == 'INCOME')
    print(f"  income: {income:,} | expenses: {len(transactions) - income:,}")
    print("\nDone! Run load_data_direct.py to load into PostgreSQL.")


if __name__ == '__main__':
    random.seed(42)
    main()
