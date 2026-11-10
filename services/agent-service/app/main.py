"""Agent service: LangGraph finance agent + savings goals + debt payoff analysis."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import goals, llm, payoff, services_client as svc
from .graph import run_agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    goals.init_db()
    yield


app = FastAPI(title="Finance Agent Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_user(x_user_id: str | None) -> str:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id")
    return x_user_id


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] | None = None


@app.get("/actuator/health")
def health():
    return {"status": "UP"}


@app.get("/api/agent/status")
def status():
    return {"provider": llm.detect_provider() or "none"}


@app.post("/api/agent/chat")
def chat(req: ChatRequest, x_user_id: str | None = Header(default=None)):
    user_id = require_user(x_user_id)
    history = [m.model_dump() for m in req.history] if req.history else None
    return run_agent(user_id, req.message, history)


# ---------- Savings goals ----------

class GoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    targetAmount: float = Field(gt=0)
    targetDate: str | None = None


class GoalContribute(BaseModel):
    amount: float = Field(gt=0)


@app.get("/api/agent/goals")
def list_goals(x_user_id: str | None = Header(default=None)):
    user_id = require_user(x_user_id)
    return goals.list_goals(user_id)


@app.post("/api/agent/goals", status_code=201)
def create_goal(body: GoalCreate, x_user_id: str | None = Header(default=None)):
    user_id = require_user(x_user_id)
    return goals.create_goal(user_id, body.name, body.targetAmount, body.targetDate)


@app.get("/api/agent/goals/{goal_id}/plan")
def goal_plan(goal_id: str, x_user_id: str | None = Header(default=None)):
    user_id = require_user(x_user_id)
    goal = goals.get_goal(user_id, goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    return goals.build_plan(goal, svc.get_transactions(user_id))


@app.post("/api/agent/goals/{goal_id}/contribute")
def contribute(goal_id: str, body: GoalContribute,
               x_user_id: str | None = Header(default=None)):
    user_id = require_user(x_user_id)
    g = goals.contribute(user_id, goal_id, body.amount)
    if not g:
        raise HTTPException(404, "Goal not found")
    return g


@app.delete("/api/agent/goals/{goal_id}", status_code=204)
def delete_goal(goal_id: str, x_user_id: str | None = Header(default=None)):
    user_id = require_user(x_user_id)
    if not goals.delete_goal(user_id, goal_id):
        raise HTTPException(404, "Goal not found")


# ---------- Debt payoff analysis ----------

@app.get("/api/agent/debts/payoff-plan")
def payoff_plan(extra_monthly_payment: float = 0,
                x_user_id: str | None = Header(default=None)):
    """Simulates avalanche vs snowball using all debts and all recorded payments."""
    user_id = require_user(x_user_id)
    debts = svc.get_debts(user_id)
    active = [d for d in debts if float(d.get("currentBalance") or 0) > 0]

    total_paid = 0.0
    payment_counts = 0
    for d in active:
        try:
            payments = svc.get_debt_payments(user_id, d["id"])
            for p in payments:
                total_paid += float(p.get("amount") or 0)
                payment_counts += 1
        except Exception:
            pass

    if not active:
        return {"debtsAnalyzed": 0, "totalPaidToDate": 0, "paymentsAnalyzed": 0,
                "recommended": None, "avalanche": None, "snowball": None}

    from decimal import Decimal
    min_total = sum(float(d.get("minimumPayment") or 0) for d in active)
    budget = Decimal(str(min_total + extra_monthly_payment))
    result = payoff.compare_strategies(active, budget)
    result.update({
        "debtsAnalyzed": len(active),
        "paymentsAnalyzed": payment_counts,
        "totalPaidToDate": round(total_paid, 2),
    })
    return result
