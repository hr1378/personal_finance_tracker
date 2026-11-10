"""Debt payoff simulation: avalanche vs snowball, month-by-month.

Pure functions over plain dicts so they are unit-testable without services.
"""
from __future__ import annotations

from decimal import Decimal


def _d(x) -> Decimal:
    return Decimal(str(x or 0))


def simulate_payoff(debts: list[dict], monthly_budget: Decimal,
                    strategy: str = "avalanche", max_months: int = 600) -> dict:
    """Simulate payoff of all debts.

    debts: list of {id, name, currentBalance, apr (percent), minimumPayment}
    monthly_budget: total $ available per month for debt payments
    strategy: 'avalanche' (highest APR first) or 'snowball' (smallest balance first)
    """
    active = [
        {
            "id": str(d.get("id")),
            "name": d.get("name", "Debt"),
            "balance": _d(d.get("currentBalance")),
            "apr": _d(d.get("apr")),
            "min": _d(d.get("minimumPayment")),
        }
        for d in debts
        if _d(d.get("currentBalance")) > 0
    ]

    if not active:
        return {"strategy": strategy, "monthsToPayoff": 0, "totalInterest": "0",
                "monthlyBudget": str(monthly_budget), "schedule": [],
                "payoffOrder": [], "feasible": True}

    total_min = sum(d["min"] for d in active)
    if monthly_budget < total_min:
        return {"strategy": strategy, "monthsToPayoff": None, "totalInterest": None,
                "monthlyBudget": str(monthly_budget), "schedule": [],
                "payoffOrder": [], "feasible": False,
                "reason": f"Monthly budget {monthly_budget} is below minimum payments {total_min}"}

    balances = {d["id"]: d["balance"] for d in active}
    aprs = {d["id"]: d["apr"] for d in active}
    mins = {d["id"]: d["min"] for d in active}
    names = {d["id"]: d["name"] for d in active}
    paid_off_order: list[str] = []
    total_interest = Decimal("0")
    schedule: list[dict] = []

    for month in range(1, max_months + 1):
        if all(b <= 0 for b in balances.values()):
            break

        # accrue monthly interest on remaining balances
        month_interest = Decimal("0")
        for did, bal in balances.items():
            if bal > 0:
                interest = (bal * aprs[did] / Decimal("100") / Decimal("12")).quantize(Decimal("0.01"))
                balances[did] = bal + interest
                month_interest += interest
        total_interest += month_interest

        # choose target debt by strategy among those still active
        active_ids = [did for did, b in balances.items() if b > 0]
        if strategy == "snowball":
            target = min(active_ids, key=lambda i: balances[i])
        else:  # avalanche
            target = max(active_ids, key=lambda i: aprs[i])

        # distribute: minimums to all, remainder to target
        remaining = monthly_budget
        payments = {}
        for did in active_ids:
            pay = min(mins[did], balances[did], remaining)
            payments[did] = pay
            remaining -= pay
        extra = min(remaining, balances[target])
        payments[target] = payments.get(target, Decimal("0")) + extra

        for did, pay in payments.items():
            balances[did] = max(Decimal("0"), balances[did] - pay)

        month_end = {names[did]: float(balances[did].quantize(Decimal("0.01")))
                     for did in active_ids if balances[did] > 0}
        if month_end:
            schedule.append({"month": month, "balances": month_end})

        for did in active_ids:
            if balances[did] <= 0 and did not in paid_off_order:
                paid_off_order.append(names[did])

    months = len(schedule)
    return {
        "strategy": strategy,
        "monthsToPayoff": months,
        "totalInterest": str(total_interest.quantize(Decimal("0.01"))),
        "monthlyBudget": str(monthly_budget),
        "schedule": schedule,
        "payoffOrder": paid_off_order,
        "feasible": months < max_months,
    }


def compare_strategies(debts: list[dict], monthly_budget: Decimal) -> dict:
    """Run both strategies and return the better one plus both results."""
    avalanche = simulate_payoff(debts, monthly_budget, "avalanche")
    snowball = simulate_payoff(debts, monthly_budget, "snowball")

    def key(r):
        if not r["feasible"]:
            return float("inf")
        return r["monthsToPayoff"]

    best = "avalanche" if key(avalanche) <= key(snowball) else "snowball"
    return {
        "recommended": best,
        "avalanche": avalanche,
        "snowball": snowball,
        "reason": (
            "Avalanche saves the most interest (highest APR first)."
            if best == "avalanche" and avalanche["feasible"]
            else "Snowball pays off small balances first for quick wins."
        ),
    }
