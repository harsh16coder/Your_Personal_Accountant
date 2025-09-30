from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
import sqlite3, requests, json, os, datetime
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()

# -----------------
# Config
# ----------------
# OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
# LLAMA_MODEL = os.getenv("LLAMA_MODEL", "llama3.1:8b-instruct")

DB_PATH = os.getenv("DB_PATH", "finance.db")
client = Cerebras(
    api_key="csk-8682t4mpjnxckyf5vwhh982e4tpm5yxkxft3tcv6dmy32mh6",
)
LLM_MODEL = "llama-4-scout-17b-16e-instruct"


# ------------------
# DB init
# -----------------
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
    CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    merchant TEXT,
    category TEXT,
    account TEXT,
    note TEXT,
    source_text TEXT NOT NULL,
    created_at TEXT NOT NULL
    )
    ''')
    cur.execute('''
    CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('buy', 'sell')),
    symbol TEXT NOT NULL,
    shares REAL NOT NULL,
    price_per_share_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    account TEXT,
    fees_cents INTEGER DEFAULT 0,
    note TEXT,
    source_text TEXT NOT NULL,
    created_at TEXT NOT NULL
    )
    ''')
    conn.commit()
    conn.close()

init_db()

# ---------------
# Pydantic models
# ---------------
class Extracted(BaseModel):
    date: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    merchant: Optional[str] = None
    category: Optional[str] = None
    account: Optional[str] = None
    note: Optional[str] = None
    symbol: Optional[str] = None
    shares: Optional[float] = None
    price_per_share: Optional[float] = None
    action_trade: Optional[Literal["buy", "sell"]] = None
    fees: Optional[float] = 0.0

class LLMResult(BaseModel):
    topic: Literal["finance", "not_finance", "unknown"]
    intent: Literal["record_expense", "record_trade", "ask_finance_question", "other"]
    action: Literal["save", "clarify", "reject", "answer"]
    extracted: Extracted
    missing: List[str] = []
    answer_draft: Optional[str] = None
    fallback_reason: Optional[str] = None
    confidence: float = 0.0

class ChatRequest(BaseModel):
    user_id: str = Field(..., description="Stable user identifier")
    message: str = Field(..., description="User's message")
    dry_run: bool = Field(False, description = "If true, do not write to DB; return the SQL that would be executed.")

class ChatResponse(BaseModel):
    status: Literal["saved", "clarify", "rejected", "answered"]
    message: str
    sql_preview: Optional[str] = None
    record_id: Optional[int] = None
    model_confidence: Optional[float] = None

# -------------------
# LLM System Prompt
# -------------------
SYSTEM_POLICY = f"""
You are FinanceRouter, a gatekeeping and extraction model for finance-only assistant.

### ALLOWED
- Personal finance: expenses, income, transfers, budgeting.
- Markets & trading: simple buy/sell events for stocks/crypto, tickers, shares, prices, fees.
- Extracting structured fields to log an expense or a trade.

### DISALLOWED
- Anything outside finance (coding, recipes, travel, jokes, politics, etc.).
- Medical, legal, or other professional advice.

### OUTPUT FORMAT
Return **ONLY** valid JSON in this scheme:

{{
    "topic": "finance" | "not_finance" | "unknown",
    "intent": "record_expense" | "record_trade" | "ask_finance_questin" | "other",
    "action": "save" | "clarify" | "reject" | "answer",
    "extracted": {{
        "date": "YYYY-MM-DD | null",
        "amount": 0.0,
        "currency": USD | ...",
        "merchant": "string | null",
        "category": "string | null",
        "account": "string | null",
        "note": "string | null",
        "symbol": "string | null",
        "shares": 0.0,
        "price_per_share": 0.0,
        "action_trade": "buy | sell | null",
        "fees": 0.0
    }},
    "missing": ["field_a", "field_b"],
    "answer_draft": "short helpful reply",
    "fallback_reason": "string",
    "confidence": 0.0
}}

### DECISION RULES
1) If the message is off-topic or nonsense topic="not_finance", action="reject".
2) If it's a finance question (**not** a loggable event) intent="ask_finance_question", action="answer".
3) For an EXPENSE event, required: amount, currency, date merchant optional.
4) For a TRADE event, requried: action_trade, symbol, shares, price_per_share, currency, date.
5) If required fields are missing action="clarify" **and enumerate** "missing".
6) Only **set** action="save" when **all** required fields exist **and** are coherent.
7) Use today's date {datetime.date.today().isoformat()} only if the user clearly implies "today".
8) Keep answers brief and neutral.
9) Output JSON only. No prose outside the JSON.
"""

# -----------------------------------
# LLM call (Ollama Chat, JSON mode)
# -----------------------------------
"""
def call_llm(user_text: str) -> LLMResult:
    payload = {
            "model": LLAMA_MODEL,
            "format": "json", # enforce JSON-only output
            "stream": False,
            "options": {"temperature": 0.1, "top_p":0.9},
            "messages": [
                {"role": "system", "content": SYSTEM_POLICY},
                {"role": "user", "content": user_text}
                ]
            }
    try:
        resp = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("message", {}).get("content", "")
        parsed = json.loads(content) # content should be valid JSON
        return LLMResult(**parsed)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")
"""
def call_llm(user_text: str) -> LLMResult:
    """
    Calls an API and enforces JSON Output
    """
    try:
        resp = client.chat.completions.create(
                model=LLM_MODEL,
                response_format={"type": "json_object"}, # force Json
                temperature=0.1,
                top_p=0.9,
                messages=[
                    {"role": "system", "content": SYSTEM_POLICY},
                    {"role": "user", "content": user_text},
                    ],
                )
        content = resp.choices[0].message.content
        parsed = json.loads(content) # valid JSON per response_format
        return LLMResult(**parsed)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

# ---------------
# Helpers
# ---------------
def to_cents(amount:float) -> int:
    return int(round((amount or 0.0) * 100))

def currency_clean(cur: Optional[str])-> str:
    if not cur: return "USD"
    cur = cur.strip().upper()
    return {"US$": "USD", "$": "USD"}.get(cur, cur)

def now_iso():
    return datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

def build_sql_and_params(user_id: str, message: str, llm: LLMResult):
    """Return (sql, params, table) or raise."""
    x = llm.extracted
    created_at = now_iso()

    if llm.intent == "record_expense":
        required = ["amount", "currency", "date"]
        missing = [f for f in required if getattr(x, f) in (None, "", 0, 0.0)]
        if missing:
            raise ValueError(f"missing fields for expense: {missing}")
        sql = """
        INSERT INTO expenses (user_id, occurred_at, amount_cents, currency, merchant, category, account, note, source_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        params = [
                user_id,
                x.date,
                to_cents(x.amount),
                currency_clean(x.currency),
                x.merchant,
                x.category,
                x.account,
                x.note,
                message,
                created_at
                ]
        return sql.strip(), params, "expenses"

    if llm.intent == "record_trade":
        required = ["action_trade", "symbol", "shares", "price_per_share", "currency", "date"]
        missing = [f for f in required in getattr(x, f) in (None, "", 0, 0.0)]
        if missing:
            raise ValueError(f"missing fields for trade: {missing}")
        sql = """
        INSERT INTO trades (user_id, occurred_at, action, symbol, shares, price_per_share_cents, currency, account, fees_cents, note, source_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        params = [
                user_id,
                x.date,
                x.action_trade,
                x.symbol.upper(),
                float(x.shares),
                to_cents(x.price_per_share),
                currency_clean(x.currency),
                x.account,
                to_cents(x.fees or 0.0),
                x.note,
                message,
                created_at
                ]
        return sql.strip(), params, "trades"

    raise ValueError("No SQL for this intent")

# --------------
# FastAPI 
# --------------
app = FastAPI(title="Finance-only Llama Chatbot", version="1.0")

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    llm = call_llm(req.message)

    # Off-topic or garbage
    if llm.action == "reject" or llm.topic != "finance":
        return ChatResponse(
                status="rejected",
                message="I can only help with finance-related requests (e.g., 'Log $12 lunch at Chipotle today').",
                model_confidence=llm.confidence
                )

    # Clarify missing fields
    if llm.action == "clarify":
        need = ", ".join(llm.missing) if llm.missing else "more details"
        return ChatResponse(
                status="clarify",
                message=f"To record this, I still need: {need}. Please provide them.",
                model_confidence=llm.confidence
                )

    # Finance question, no DB write
    if llm.action == "answer" and llm.intent == "ask_finance_question":
        draft = llm.answer_draft or "Heres a short answer on your finance question."
        return ChatResponse(
                status="answered",
                message=draft,
                model_confidence=llm.confidence
                )

    # Save event (expense or trade)
    if llm.action == "save":
        try:
            sql, params, table = build_sql_and_params(req.user_id, req.message, llm)
        except Exception as e:
            return ChatResponse(
                    status="clarify",
                    message=f"I'm missing details to save this: {str(e)}",
                    model_confidence=llm.confidence
                    )

        if req.dry_run:
            return ChatResponse(
                    status="saved",
                    message=f"(dry-run) Would save to {table}.",
                    sql_preview=f"{sql} -- params={params}",
                    model_confidence=llm.confidence
                    )

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(sql, params) # parameterized = SQL injection safe
        rid = cur.lastrowid
        conn.commit()
        conn.close()

        confirmation = llm.answer_draft or f"Saved your {('expense' if table=='expenses' else 'trade')}."
        return ChatResponse(
                status="saved",
                message=confirmation,
                record_id=rid,
                model_confidence=llm.confidence
                )

    # Fallback
    return ChatResponse(
            status="rejected",
            message=llm.fallback_reason or "I can only help with finance logging or questions.",
            model_confidence=llm.confidence
            )




