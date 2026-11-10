"""Thin HTTP client for the Java microservices. All calls forward X-User-Id."""
import httpx

from . import config

TIMEOUT = 30.0


def _headers(user_id: str) -> dict:
    return {"X-User-Id": user_id, "Content-Type": "application/json"}


def _client() -> httpx.Client:
    return httpx.Client(timeout=TIMEOUT)


def get_transactions(user_id: str) -> list[dict]:
    with _client() as c:
        r = c.get(f"{config.TRANSACTION_SERVICE_URL}/api/transactions",
                  headers=_headers(user_id))
        r.raise_for_status()
        return r.json()


def create_transaction(user_id: str, payload: dict) -> dict:
    body = {"userId": user_id, **payload}
    with _client() as c:
        r = c.post(f"{config.TRANSACTION_SERVICE_URL}/api/transactions",
                   headers=_headers(user_id), json=body)
        r.raise_for_status()
        return r.json()


def get_budgets(user_id: str) -> list[dict]:
    with _client() as c:
        r = c.get(f"{config.BUDGET_SERVICE_URL}/api/budgets/user/{user_id}",
                  headers=_headers(user_id))
        r.raise_for_status()
        return r.json()


def create_budget(user_id: str, payload: dict) -> dict:
    body = {"userId": user_id, **payload}
    with _client() as c:
        r = c.post(f"{config.BUDGET_SERVICE_URL}/api/budgets",
                   headers=_headers(user_id), json=body)
        r.raise_for_status()
        return r.json()


def get_debts(user_id: str) -> list[dict]:
    with _client() as c:
        r = c.get(f"{config.DEBT_SERVICE_URL}/api/debts/user/{user_id}",
                  headers=_headers(user_id))
        r.raise_for_status()
        return r.json()


def create_debt(user_id: str, payload: dict) -> dict:
    body = {"userId": user_id, **payload}
    with _client() as c:
        r = c.post(f"{config.DEBT_SERVICE_URL}/api/debts",
                   headers=_headers(user_id), json=body)
        r.raise_for_status()
        return r.json()


def get_debt_payments(user_id: str, debt_id: str) -> list[dict]:
    with _client() as c:
        r = c.get(f"{config.DEBT_SERVICE_URL}/api/debts/{debt_id}/payments",
                  headers=_headers(user_id))
        r.raise_for_status()
        return r.json()


def create_debt_payment(user_id: str, debt_id: str, payload: dict) -> dict:
    body = {"userId": user_id, "debtId": debt_id, **payload}
    with _client() as c:
        r = c.post(f"{config.DEBT_SERVICE_URL}/api/debts/{debt_id}/payments",
                   headers=_headers(user_id), json=body)
        r.raise_for_status()
        return r.json()


def get_dashboard_summary(user_id: str) -> dict:
    with _client() as c:
        r = c.get(f"{config.DASHBOARD_SERVICE_URL}/api/dashboard/summary/{user_id}",
                  headers=_headers(user_id))
        r.raise_for_status()
        return r.json()


def get_accounts(user_id: str) -> list[dict]:
    with _client() as c:
        r = c.get(f"{config.ACCOUNTS_SERVICE_URL}/api/accounts/user/{user_id}",
                  headers=_headers(user_id))
        r.raise_for_status()
        return r.json()
