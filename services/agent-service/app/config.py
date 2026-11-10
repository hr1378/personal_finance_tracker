import os

# LLM provider keys (auto-detected in order: openai -> anthropic -> gemini)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# Downstream Java service URLs
TRANSACTION_SERVICE_URL = os.getenv("TRANSACTION_SERVICE_URL", "http://localhost:8082")
BUDGET_SERVICE_URL = os.getenv("BUDGET_SERVICE_URL", "http://localhost:8083")
DEBT_SERVICE_URL = os.getenv("DEBT_SERVICE_URL", "http://localhost:8084")
DASHBOARD_SERVICE_URL = os.getenv("DASHBOARD_SERVICE_URL", "http://localhost:8085")
ACCOUNTS_SERVICE_URL = os.getenv("ACCOUNTS_SERVICE_URL", "http://localhost:8086")

# Postgres for agent-owned data (savings goals)
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "finance_tracker")
POSTGRES_USER = os.getenv("POSTGRES_USER", "finance_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "finance_password")
