"""LangChain tools that act on the user's finance data via the Java services.

Tools are built per-request so each closes over the authenticated user_id.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

from langchain_core.tools import tool

from . import goals, payoff, services_client as svc


def build_tools(user_id: str) -> list:

    @tool
    def add_transaction(type: str, amount: float, category: str,
                        description: str, date: str = "") -> str:
        """Record a new transaction. type is INCOME or EXPENSE.
        amount is a positive number. date is YYYY-MM-DD (defaults to today)."""
        payload = {
            "type": type.upper(),
            "amount": amount,
            "category": category,
            "description": description,
            "date": date or date.today().isoformat(),
        }
        try:
            tx = svc.create_transaction(user_id, payload)
            return f"Transaction created: {tx.get('type')} ${tx.get('amount')} - {tx.get('description')} (id {tx.get('id')})"
        except Exception as e:
            return f"Failed to create transaction: {e}"

    @tool
    def create_budget(category: str, spending_limit: float,
                      month: int, year: int) -> str:
        """Create a monthly spending budget for a category."""
        try:
            b = svc.create_budget(user_id, {
                "category": category,
                "spendingLimit": spending_limit,
                "month": month,
                "year": year,
            })
            return f"Budget created: {b.get('category')} limit ${b.get('spendingLimit')} for {b.get('month')}/{b.get('year')}"
        except Exception as e:
            return f"Failed to create budget: {e}"

    @tool
    def create_debt(name: str, original_balance: float, apr: float,
                    minimum_payment: float, due_date: str = "") -> str:
        """Create a new debt (loan, credit card balance, etc.). apr is annual percent."""
        try:
            d = svc.create_debt(user_id, {
                "name": name,
                "originalBalance": original_balance,
                "currentBalance": original_balance,
                "apr": apr,
                "minimumPayment": minimum_payment,
                "dueDate": due_date or None,
            })
            return f"Debt created: {d.get('name')} balance ${d.get('currentBalance')} at {d.get('apr')}% APR"
        except Exception as e:
            return f"Failed to create debt: {e}"

    @tool
    def record_debt_payment(debt_name: str, amount: float, note: str = "") -> str:
        """Record a payment against a debt. debt_name is matched against existing debts."""
        try:
            debts = svc.get_debts(user_id)
            match = next((d for d in debts
                          if debt_name.lower() in (d.get("name") or "").lower()), None)
            if not match:
                names = ", ".join(d.get("name", "?") for d in debts[:10])
                return f"No debt matching '{debt_name}'. Existing debts: {names}"
            p = svc.create_debt_payment(user_id, match["id"], {
                "amount": amount,
                "paymentDate": date.today().isoformat(),
                "note": note or "Payment via assistant",
            })
            return f"Payment of ${amount} recorded on '{match['name']}' (payment id {p.get('id')})"
        except Exception as e:
            return f"Failed to record payment: {e}"

    @tool
    def create_savings_goal(name: str, target_amount: float,
                            target_date: str = "") -> str:
        """Create a savings goal. target_date is YYYY-MM-DD (optional)."""
        try:
            g = goals.create_goal(user_id, name, target_amount, target_date or None)
            return f"Savings goal created: '{g['name']}' target ${g['target_amount']} (id {g['id']})"
        except Exception as e:
            return f"Failed to create goal: {e}"

    @tool
    def contribute_to_goal(goal_name: str, amount: float) -> str:
        """Add money to a savings goal. goal_name is matched against existing goals."""
        try:
            existing = goals.list_goals(user_id)
            match = next((g for g in existing
                          if goal_name.lower() in (g.get("name") or "").lower()), None)
            if not match:
                names = ", ".join(g.get("name", "?") for g in existing[:10]) or "none"
                return f"No goal matching '{goal_name}'. Existing goals: {names}"
            g = goals.contribute(user_id, match["id"], amount)
            return (f"Contributed ${amount} to '{g['name']}'. "
                    f"Progress: ${g['current_amount']}/${g['target_amount']}")
        except Exception as e:
            return f"Failed to contribute: {e}"

    @tool
    def get_savings_plan(goal_name: str = "") -> str:
        """Analyze the user's finances and produce a savings plan for a goal
        (or all goals if goal_name is empty)."""
        try:
            txs = svc.get_transactions(user_id)
            goals_list = goals.list_goals(user_id)
            if goal_name:
                goals_list = [g for g in goals_list
                              if goal_name.lower() in (g.get("name") or "").lower()]
            if not goals_list:
                return "No savings goals found. Create one first."
            plans = [goals.build_plan(g, txs) for g in goals_list]
            import json
            return json.dumps(plans, indent=2, default=str)
        except Exception as e:
            return f"Failed to build savings plan: {e}"

    @tool
    def get_payoff_plan(extra_monthly_payment: float = 0) -> str:
        """Analyze ALL debts and ALL recorded payments, then simulate
        avalanche vs snowball payoff strategies month-by-month."""
        try:
            debts = svc.get_debts(user_id)
            active = [d for d in debts if float(d.get("currentBalance") or 0) > 0]
            if not active:
                return "No outstanding debts."

            # Analyze payment history: average monthly amount paid per debt
            total_paid = 0.0
            for d in active:
                try:
                    payments = svc.get_debt_payments(user_id, d["id"])
                    total_paid += sum(float(p.get("amount") or 0) for p in payments)
                except Exception:
                    pass

            # monthly budget = sum of minimums + user's extra payment
            min_total = sum(float(d.get("minimumPayment") or 0) for d in active)
            budget = Decimal(str(min_total + extra_monthly_payment))

            result = payoff.compare_strategies(active, budget)
            result["totalPaidToDate"] = round(total_paid, 2)
            result["debtsAnalyzed"] = len(active)
            import json
            return json.dumps(result, indent=2, default=str)
        except Exception as e:
            return f"Failed to build payoff plan: {e}"

    @tool
    def get_finance_summary() -> str:
        """Get the user's dashboard summary: balances, spending, recent activity."""
        try:
            return str(svc.get_dashboard_summary(user_id))
        except Exception as e:
            return f"Failed to get summary: {e}"

    @tool
    def list_savings_goals() -> str:
        """List all savings goals with progress."""
        try:
            gs = goals.list_goals(user_id)
            if not gs:
                return "No savings goals yet."
            import json
            return json.dumps(gs, indent=2, default=str)
        except Exception as e:
            return f"Failed to list goals: {e}"

    return [
        add_transaction, create_budget, create_debt, record_debt_payment,
        create_savings_goal, contribute_to_goal, get_savings_plan,
        get_payoff_plan, get_finance_summary, list_savings_goals,
    ]
