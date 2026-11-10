"""Savings goal persistence (Postgres `agent` schema) and plan analysis."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

import psycopg2
import psycopg2.extras

from . import config

DDL = """
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
"""


def _conn():
    return psycopg2.connect(
        host=config.POSTGRES_HOST, port=config.POSTGRES_PORT,
        dbname=config.POSTGRES_DB, user=config.POSTGRES_USER,
        password=config.POSTGRES_PASSWORD)


def init_db():
    with _conn() as conn, conn.cursor() as cur:
        cur.execute(DDL)


def create_goal(user_id: str, name: str, target_amount: float,
                target_date: str | None = None) -> dict:
    gid = str(uuid.uuid4())
    with _conn() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """INSERT INTO agent.savings_goals (id, user_id, name, target_amount, target_date)
               VALUES (%s,%s,%s,%s,%s) RETURNING *""",
            (gid, user_id, name, target_amount, target_date))
        return dict(cur.fetchone())


def list_goals(user_id: str) -> list[dict]:
    with _conn() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM agent.savings_goals WHERE user_id=%s ORDER BY created_at",
            (user_id,))
        return [dict(r) for r in cur.fetchall()]


def get_goal(user_id: str, goal_id: str) -> dict | None:
    with _conn() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            "SELECT * FROM agent.savings_goals WHERE id=%s AND user_id=%s",
            (goal_id, user_id))
        row = cur.fetchone()
        return dict(row) if row else None


def contribute(user_id: str, goal_id: str, amount: float) -> dict | None:
    with _conn() as conn, conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """UPDATE agent.savings_goals
               SET current_amount = current_amount + %s
               WHERE id=%s AND user_id=%s RETURNING *""",
            (amount, goal_id, user_id))
        row = cur.fetchone()
        return dict(row) if row else None


def delete_goal(user_id: str, goal_id: str) -> bool:
    with _conn() as conn, conn.cursor() as cur:
        cur.execute(
            "DELETE FROM agent.savings_goals WHERE id=%s AND user_id=%s",
            (goal_id, user_id))
        return cur.rowcount > 0


def build_plan(goal: dict, transactions: list[dict]) -> dict:
    """Analyze transaction history and produce a savings plan for a goal."""
    target = float(goal["target_amount"])
    current = float(goal["current_amount"])
    remaining = max(0.0, target - current)

    months_left = None
    if goal.get("target_date"):
        td = goal["target_date"]
        if isinstance(td, str):
            td = date.fromisoformat(td)
        today = date.today()
        months_left = max(1, (td.year - today.year) * 12 + (td.month - today.month))

    # bucket transactions by month to compute surplus and category spend
    monthly_net: dict[str, float] = {}
    monthly_exp_by_cat: dict[str, dict[str, float]] = {}
    for t in transactions:
        d = t.get("date")
        if not d:
            continue
        if isinstance(d, str):
            d = date.fromisoformat(d[:10])
        key = f"{d.year}-{d.month:02d}"
        amt = float(t.get("amount") or 0)
        if str(t.get("type", "")).upper() == "INCOME":
            monthly_net[key] = monthly_net.get(key, 0.0) + amt
        else:
            cat = t.get("category") or "Other"
            monthly_net[key] = monthly_net.get(key, 0.0) - amt
            monthly_exp_by_cat.setdefault(key, {})
            monthly_exp_by_cat[key][cat] = monthly_exp_by_cat[key].get(cat, 0.0) + amt

    n_months = max(1, len(monthly_net))
    avg_surplus = sum(max(0.0, v) for v in monthly_net.values()) / n_months

    required_monthly = remaining / months_left if months_left else None
    recommended = None
    if required_monthly is not None:
        # recommend up to 50% of avg surplus, capped at what's needed
        recommended = round(min(required_monthly, avg_surplus * 0.5), 2)
        if recommended <= 0:
            recommended = round(min(required_monthly, 100.0), 2)

    # top discretionary categories to trim (largest avg monthly spend)
    cat_totals: dict[str, float] = {}
    for m in monthly_exp_by_cat.values():
        for cat, amt in m.items():
            cat_totals[cat] = cat_totals.get(cat, 0.0) + amt / n_months
    trim_candidates = sorted(cat_totals.items(), key=lambda kv: -kv[1])[:5]

    return {
        "goal": goal,
        "remaining": round(remaining, 2),
        "monthsLeft": months_left,
        "avgMonthlySurplus": round(avg_surplus, 2),
        "requiredMonthlyContribution": round(required_monthly, 2) if required_monthly else None,
        "recommendedMonthlyContribution": recommended,
        "progressPct": round(current / target * 100, 1) if target else 0,
        "topSpendingCategories": [
            {"category": c, "avgMonthlySpend": round(a, 2)} for c, a in trim_candidates
        ],
        "suggestion": (
            f"Contribute ~${recommended}/month"
            if recommended else "Set a target date to get a contribution plan"
        ),
    }
