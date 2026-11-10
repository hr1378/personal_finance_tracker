from decimal import Decimal

from app.payoff import compare_strategies, simulate_payoff


def debt(id, name, balance, apr, min_pay):
    return {"id": id, "name": name, "currentBalance": balance,
            "apr": apr, "minimumPayment": min_pay}


def test_avalanche_pays_highest_apr_first():
    debts = [
        debt("1", "LowAPR", 1000, 5.0, 50),
        debt("2", "HighAPR", 500, 24.0, 25),
    ]
    result = simulate_payoff(debts, Decimal("200"), "avalanche")
    assert result["feasible"]
    assert result["payoffOrder"][0] == "HighAPR"
    assert result["monthsToPayoff"] > 0
    assert Decimal(result["totalInterest"]) > 0


def test_snowball_pays_smallest_balance_first():
    debts = [
        debt("1", "BigBalance", 5000, 20.0, 100),
        debt("2", "SmallBalance", 300, 10.0, 15),
    ]
    result = simulate_payoff(debts, Decimal("200"), "snowball")
    assert result["feasible"]
    assert result["payoffOrder"][0] == "SmallBalance"


def test_infeasible_when_budget_below_minimums():
    debts = [debt("1", "A", 1000, 20.0, 100), debt("2", "B", 500, 10.0, 50)]
    result = simulate_payoff(debts, Decimal("100"), "avalanche")
    assert not result["feasible"]
    assert result["monthsToPayoff"] is None


def test_no_debts():
    result = simulate_payoff([], Decimal("100"), "avalanche")
    assert result["monthsToPayoff"] == 0
    assert result["feasible"]


def test_compare_recommends_valid_strategy():
    debts = [debt("1", "A", 2000, 18.0, 50), debt("2", "B", 800, 6.0, 30)]
    result = compare_strategies(debts, Decimal("300"))
    assert result["recommended"] in ("avalanche", "snowball")
    assert result["avalanche"]["feasible"]
    assert result["snowball"]["feasible"]
    # avalanche should cost less or equal interest
    assert Decimal(result["avalanche"]["totalInterest"]) <= \
        Decimal(result["snowball"]["totalInterest"])


def test_zero_balance_debts_excluded():
    debts = [debt("1", "PaidOff", 0, 20.0, 50), debt("2", "Active", 1000, 15.0, 50)]
    result = simulate_payoff(debts, Decimal("150"), "avalanche")
    assert result["payoffOrder"] == ["Active"]
