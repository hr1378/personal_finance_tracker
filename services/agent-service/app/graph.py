"""LangGraph ReAct agent assembly."""
from __future__ import annotations

from langgraph.prebuilt import create_react_agent

from . import llm
from .tools import build_tools

SYSTEM_PROMPT = """You are a personal finance agent with tools to manage the user's finances.

Rules:
- Use tools to perform actions (add transactions, budgets, debts, payments, savings goals).
- For questions about balances/spending, use get_finance_summary first.
- For savings advice, use get_savings_plan. For debt strategy, use get_payoff_plan.
- When the user asks to DO something ("add", "create", "record", "save"), call the
  matching tool immediately, then confirm what was done.
- Amounts are positive numbers. Dates are YYYY-MM-DD.
- Be concise. If a tool fails, explain why and suggest what the user can do.
"""


def build_agent(user_id: str):
    model = llm.get_llm()
    if model is None:
        return None
    return create_react_agent(model, build_tools(user_id))


def run_agent(user_id: str, message: str, history: list[dict] | None = None) -> dict:
    """Run the agent and return {reply, provider, actions_taken}."""
    provider = llm.detect_provider()
    if provider is None:
        return {
            "reply": "No AI provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY.",
            "provider": "none",
            "actions_taken": [],
        }

    agent = build_agent(user_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        messages.extend(
            {"role": m["role"], "content": m["content"]}
            for m in history[-20:]
            if m.get("role") in ("user", "assistant") and m.get("content")
        )
    messages.append({"role": "user", "content": message})

    result = agent.invoke({"messages": messages})
    agent_messages = result.get("messages", [])

    # final reply = last AI message
    reply = ""
    for m in reversed(agent_messages):
        if getattr(m, "type", None) == "ai" or m.__class__.__name__ == "AIMessage":
            reply = m.content if isinstance(m.content, str) else str(m.content)
            break

    # actions taken = tool calls that succeeded (ToolMessage outputs)
    actions = []
    for m in agent_messages:
        if m.__class__.__name__ == "ToolMessage":
            content = m.content if isinstance(m.content, str) else str(m.content)
            if not content.startswith("Failed"):
                actions.append(content[:300])

    return {"reply": reply or "(no response)", "provider": provider,
            "actions_taken": actions}
