
import os, json, sqlite3, datetime, uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel
from typing import Optional, List, Literal
from dotenv import load_dotenv

# ------------------- Load env -------------------
load_dotenv()
DB_PATH      = os.getenv("DB_PATH", "finance.db")
ORIGINS      = os.getenv("CORS_ALLOW_ORIGINS", "*")

# lazy import to avoid import-time errors if package missing
from cerebras.cloud.sdk import Cerebras
client = Cerebras(
        api_key="csk-8682t4mpjnxckyf5vwhh982e4tpm5yxkxft3tcv6dmy32mh6",)
LLM_MODEL = "llama-4-scout-17b-16e-instruct"

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ORIGINS}})

# ------------------- DB helpers -------------------
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    # sessions and messages for chat persistence
    cur.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      summary TEXT,
      created_at TEXT NOT NULL
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL, -- 'user' | 'assistant'
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
    """)

    # expenses tables
    cur.execute("""
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
    """)

    # trades
    cur.execute("""
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('buy','sell')),
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
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS liabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      liability_type TEXT NOT NULL,                    -- e.g., 'Student Loan', 'Car Payment'
      liability_amount_cents INTEGER NOT NULL,         -- original total amount
      installments_total INTEGER,                      -- total # of installments planned
      installments_paid INTEGER DEFAULT 0,             -- # paid so far
      installment_amount_cents INTEGER,                -- per-installment amount
      frequency TEXT DEFAULT 'monthly' CHECK(          -- 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one_time'
        frequency IN ('weekly','monthly','quarterly','yearly','one_time')
      ),
      due_date TEXT,                                   -- original/anchor due date (YYYY-MM-DD)
      next_due_date TEXT,                              -- next upcoming due date (YYYY-MM-DD)
      importance_score INTEGER,                        -- from mock
      priority INTEGER,                                -- from mock
      remaining_amount_cents INTEGER,                  -- remaining principal/amount
      is_completed INTEGER DEFAULT 0,                  -- 0/1 boolean
      description TEXT,
      created_at TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

init_db()

def now_iso():
    return datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

def to_cents(amount: float) -> int:
    return int(round((amount or 0.0) * 100))

def currency_clean(cur: Optional[str]) -> str:
    if not cur: return "USD"
    cur = cur.strip().upper()
    return {"US$":"USD","$":"USD"}.get(cur, cur)

# ------------------- LLM policy -------------------
SYSTEM_POLICY = f"""
You are FinanceRouter, a gatekeeping and extraction model for a finance-only assistant.
You classify and extract finance-related data (expenses, trades, liabilities) and reply briefly to general greetings.

### ALLOWED
- Personal finance: expenses, income, transfers, budgeting.
- Markets & trading: simple buy/sell events for stocks/crypto (tickers, shares, prices, fees).
- Liabilities & loans: student loans, car payments, credit cards, mortgages, or any debt.
- General conversational greetings and pleasantries (e.g., "Hi", "Hello", "How are you?").

### DISALLOWED
- Anything outside finance or light small talk (e.g., coding, recipes, travel, jokes, politics, etc.).
- Medical, legal, or other professional advice.

---

### OUTPUT FORMAT
Return **ONLY** valid JSON in this schema:

{{
  "topic": "finance" | "not_finance" | "unknown" | "greeting",
  "intent": "record_expense" | "record_trade" | "record_liability" | "ask_finance_question" | "other",
  "action": "save" | "clarify" | "reject" | "answer",
  "extracted": {{
    "date": "YYYY-MM-DD | null",
    "amount": 0.0,
    "currency": "USD | ...",
    "merchant": "string | null",
    "category": "string | null",
    "account": "string | null",
    "note": "string | null",
    "symbol": "string | null",
    "shares": 0.0,
    "price_per_share": 0.0,
    "action_trade": "buy | sell | null",
    "fees": 0.0,

    // New: liability-related fields
    "liability_type": "string | null",
    "liability_amount": 0.0,
    "installments_total": 0,
    "installments_paid": 0,
    "installment_amount": 0.0,
    "frequency": "weekly | monthly | quarterly | yearly | one_time | null",
    "due_date": "YYYY-MM-DD | null",
    "next_due_date": "YYYY-MM-DD | null",
    "importance_score": 0,
    "priority": 0,
    "remaining_amount": 0.0,
    "is_completed": false,
    "description": "string | null"
  }},
  "missing": ["field_a", "field_b"],
  "answer_draft": "short helpful or friendly reply",
  "fallback_reason": "string",
  "confidence": 0.0
}}

---

### DECISION RULES

1) If the message is clearly unrelated to finance (e.g., about programming, sports, politics), → topic="not_finance", action="reject".
2) If the message is a greeting (e.g., "hi", "hello", "good morning") → topic="greeting", action="answer", answer_draft="Hi there! How can I help with your finances today?".
3) If it's a finance question (not a transaction entry) → intent="ask_finance_question", action="answer".
4) For an **EXPENSE** event, required fields: amount, currency, date. (merchant optional)
5) For a **TRADE** event, required: action_trade, symbol, shares, price_per_share, currency, date.
6) For a **LIABILITY** event, required: liability_type, liability_amount, frequency, due_date.  
   - Optional: installments_total, installments_paid, installment_amount, importance_score, priority, description.
7) If required fields are missing → action="clarify" and list them in "missing".
8) Only set action="save" when all required fields exist and are coherent.
9) Use today's date {datetime.date.today().isoformat()} only if the user clearly implies "today".
10) Keep answers brief, helpful, and neutral.
11) Always return strictly valid JSON — no markdown or extra text outside the JSON.

---
"""

# ------------------- LLM call -------------------
def llm_route_extract(message: str, history: List[dict]) -> dict:
    """
    Calls an OpenAI-compatible/Cerebras Chat Completions API and enforces JSON output.
    history: list of {"role": "user"|"assistant", "content": str}
    """
    messages = [{"role": "system", "content": SYSTEM_POLICY}]
    # include recent history for context (last 20 turns)
    for m in history[-20:]:
        if m.get("role") in ("user", "assistant"):
            messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": message})

    resp = client.chat.completions.create(
        model=LLM_MODEL,
        response_format={"type": "json_object"},
        temperature=0.1,
        top_p=0.9,
        messages=messages,
    )
    print(resp)
    content = resp.choices[0].message.content
    try:
        parsed = json.loads(content)
        return parsed
    except Exception as e:
        # Fallback: reject gracefully
        return {
            "topic": "unknown",
            "intent": "other",
            "action": "reject",
            "extracted": {},
            "missing": [],
            "answer_draft": None,
            "fallback_reason": f"Parse error: {e}",
            "confidence": 0.0,
        }

# ------------------- SQL builder -------------------
# ------------------- SQL builder -------------------
def build_sql_and_params(user_id: str, source_text: str, llm: dict):
    x = llm.get("extracted", {}) or {}
    created_at = now_iso()

    def missing(fields):
        # treat empty strings / None as missing
        return [f for f in fields if x.get(f) in (None, "", [])]

    # ---------------- Expenses ----------------
    if llm.get("intent") == "record_expense":
        req = ["amount", "currency", "date"]
        miss = missing(req)
        if miss:
            raise ValueError(f"missing fields for expense: {miss}")
        sql = """
        INSERT INTO expenses (user_id, occurred_at, amount_cents, currency, merchant,
                              category, account, note, source_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = [
            user_id,
            x.get("date"),
            to_cents(float(x.get("amount"))),
            currency_clean(x.get("currency")),
            x.get("merchant"),
            x.get("category"),
            x.get("account"),
            x.get("note"),
            source_text,
            created_at,
        ]
        return sql.strip(), params, "expenses"

    # ---------------- Trades ----------------
    if llm.get("intent") == "record_trade":
        req = ["action_trade", "symbol", "shares", "price_per_share", "currency", "date"]
        miss = missing(req)
        if miss:
            raise ValueError(f"missing fields for trade: {miss}")
        sql = """
        INSERT INTO trades (user_id, occurred_at, action, symbol, shares,
                            price_per_share_cents, currency, account, fees_cents,
                            note, source_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = [
            user_id,
            x.get("date"),
            x.get("action_trade"),
            (x.get("symbol") or "").upper(),
            float(x.get("shares")),
            to_cents(float(x.get("price_per_share"))),
            currency_clean(x.get("currency")),
            x.get("account"),
            to_cents(float(x.get("fees") or 0.0)),
            x.get("note"),
            source_text,
            created_at,
        ]
        return sql.strip(), params, "trades"

    # ---------------- Liabilities (NEW) ----------------
    if llm.get("intent") == "record_liability":
        # Minimal set required to create a liability row
        # (Aligns with your policy: type, amount, frequency, due_date)
        req = ["liability_type", "liability_amount", "frequency", "due_date"]
        miss = missing(req)
        if miss:
            raise ValueError(f"missing fields for liability: {miss}")

        # Normalize booleans and numeric fields
        def to_bool(v):
            return 1 if v in (True, 1, "1", "true", "True", "yes", "YES") else 0

        liability_type = (x.get("liability_type") or "").strip()
        liability_amount = float(x.get("liability_amount") or 0.0)

        installments_total = x.get("installments_total")
        installments_total = int(installments_total) if installments_total not in (None, "") else None

        installments_paid = x.get("installments_paid")
        installments_paid = int(installments_paid) if installments_paid not in (None, "") else 0

        installment_amount = x.get("installment_amount")
        installment_amount_cents = (
            to_cents(float(installment_amount)) if installment_amount not in (None, "") else None
        )

        frequency = (x.get("frequency") or "monthly").strip().lower()
        # Ensure frequency is one of the allowed values, else default to 'monthly'
        if frequency not in ("weekly", "monthly", "quarterly", "yearly", "one_time"):
            frequency = "monthly"

        due_date = x.get("due_date") or None
        next_due_date = x.get("next_due_date") or due_date

        importance_score = x.get("importance_score")
        importance_score = int(importance_score) if importance_score not in (None, "") else None

        priority = x.get("priority")
        priority = int(priority) if priority not in (None, "") else None

        remaining_amount = x.get("remaining_amount")
        # If remaining not provided, derive from liability - (installment * paid) when possible
        if remaining_amount in (None, ""):
            try:
                if installment_amount is not None and installments_paid is not None:
                    remaining_amount = max(0.0, float(liability_amount) - float(installment_amount) * float(installments_paid))
                else:
                    remaining_amount = float(liability_amount)
            except Exception:
                remaining_amount = float(liability_amount)

        remaining_amount_cents = to_cents(float(remaining_amount)) if remaining_amount not in (None, "") else None

        is_completed = to_bool(x.get("is_completed"))

        description = x.get("description")

        sql = """
        INSERT INTO liabilities (
            user_id,
            liability_type,
            liability_amount_cents,
            installments_total,
            installments_paid,
            installment_amount_cents,
            frequency,
            due_date,
            next_due_date,
            importance_score,
            priority,
            remaining_amount_cents,
            is_completed,
            description,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = [
            user_id,
            liability_type,
            to_cents(liability_amount),
            installments_total,
            installments_paid,
            installment_amount_cents,
            frequency,
            due_date,
            next_due_date,
            importance_score,
            priority,
            remaining_amount_cents,
            is_completed,
            description,
            created_at,
        ]

        return sql.strip(), params, "liabilities"

    # ---------------- No match ----------------
    raise ValueError("No SQL for this intent")


# ------------------- API endpoints -------------------
@app.post("/api/sessions")
def create_session():
    data = request.get_json(force=True) or {}
    user_id = data.get("user_id") or "demo-user"
    title = data.get("title") or "New chat"
    sid = data.get("session_id") or str(uuid.uuid4())

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO sessions (id, user_id, title, summary, created_at) VALUES (?, ?, ?, ?, ?)",
                (sid, user_id, title, "", now_iso()))
    conn.commit()
    conn.close()
    return jsonify({"session_id": sid, "title": title})

# Check if session exists
@app.get("/api/sessions/<sid>/validate")
def validate_session(sid):
    """Check whether a session ID exists in the database."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM sessions WHERE id = ?", (sid,))
    exists = cur.fetchone() is not None
    conn.close()
    return jsonify({"valid": exists})

@app.get("/api/sessions/<sid>/messages")
def get_messages(sid):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY id ASC", (sid,))
    rows = cur.fetchall()
    conn.close()
    msgs = [{"role": r["role"], "content": r["content"], "created_at": r["created_at"]} for r in rows]
    return jsonify({"messages": msgs})

@app.post("/api/chat")
def chat():
    data = request.get_json(force=True) or {}
    print(data)
    user_id = data.get("user_id") or "demo-user"
    session_id = data.get("session_id")
    message = data.get("message", "").strip()

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    if not message:
        return jsonify({"error": "message is empty"}), 400

    conn = get_conn()
    cur = conn.cursor()

    # ensure session exists
    cur.execute("SELECT id FROM sessions WHERE id = ?", (session_id,))
    if not cur.fetchone():
        conn.close()
        return jsonify({"error": "invalid session_id"}), 404

    # fetch recent history
    cur.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
    history_rows = cur.fetchall()
    history = [{"role": r["role"], "content": r["content"]} for r in history_rows]

    # save user message
    cur.execute("INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (session_id, "user", message, now_iso()))
    conn.commit()

    # call LLM router
    llm_json = llm_route_extract(message, history)

    status = "answered"
    reply = llm_json.get("answer_draft") or "Okay."
    meta = {"action": llm_json.get("action"), "intent": llm_json.get("intent")}

    # enforce topic and actions
    if llm_json.get("action") == "reject" or llm_json.get("topic") != "finance":
        status = "rejected"
        reply = "I can only help with finance-related requests (e.g., 'Log $12 lunch at Chipotle today')."

    elif llm_json.get("action") == "clarify":
        status = "clarify"
        missing = llm_json.get("missing") or []
        need = ", ".join(missing) if missing else "more details"
        reply = f"To record this, I still need: {need}. Please provide them."

    elif llm_json.get("action") == "save":
        try:
            sql, params, table = build_sql_and_params(user_id, message, llm_json)
            cur.execute(sql, params)
            rid = cur.lastrowid
            conn.commit()
            status = "saved"
            if table == "expenses":
                reply = "Saved your expense."
            elif table == "trades":
                reply = "Saved your trade."
            else:
                reply = "Saved your liability"
            meta["record_id"] = rid
            meta["table"] = table
        except Exception as e:
            status = "clarify"
            reply = f"I’m missing details to save this: {e}"

    # save assistant message
    cur.execute("INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (session_id, "assistant", reply, now_iso()))
    conn.commit()
    conn.close()

    return jsonify({"status": status, "reply": reply, "meta": meta})

# ------------------- Dashboard API -------------------
@app.get("/api/dashboard")
def get_dashboard():
    """Get dashboard overview data"""
    # For now, return mock data since we don't have assets/liabilities tables yet
    # This will be expanded when those tables are added
    mock_user = {
        "id": 1,
        "name": "Demo User",
        "email": "demo@example.com",
        "monthly_income": 5500
    }
    
    # Mock assets and liabilities data - replace with real DB queries later
    total_assets = 8700
    total_liabilities = 16200
    active_liabilities_count = 4
    
    return jsonify({
        "user": mock_user,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": total_assets - total_liabilities,
        "active_liabilities_count": active_liabilities_count,
        "high_priority_liabilities": [
            {
                "liability": {
                    "id": 1,
                    "liability_type": "Student Loan",
                    "remaining_amount": 12500,
                    "priority": 95,
                    "next_due_date": "2024-10-15"
                },
                "priority_score": 95
            },
            {
                "liability": {
                    "id": 2,
                    "liability_type": "Car Payment",
                    "remaining_amount": 2500,
                    "priority": 88,
                    "next_due_date": "2024-10-20"
                },
                "priority_score": 88
            }
        ]
    })

# ------------------- Assets API -------------------
@app.get("/api/assets")
def get_assets():
    """Get user assets"""
    mock_assets = [
        {
            "id": 1,
            "user_id": 1,
            "asset_type": "Savings Account",
            "asset_value": 5500,
            "asset_description": "Emergency fund",
            "created_at": "2024-01-01T00:00:00.000Z"
        },
        {
            "id": 2,
            "user_id": 1,
            "asset_type": "Investment",
            "asset_value": 3200,
            "asset_description": "Stock portfolio",
            "created_at": "2024-02-01T00:00:00.000Z"
        }
    ]
    return jsonify({"assets": mock_assets})

# ------------------- Liabilities API -------------------
@app.get("/api/liabilities")
def get_liabilities():
    """Get user liabilities"""
    mock_liabilities = [
        {
            "id": 1,
            "user_id": 1,
            "liability_type": "Student Loan",
            "liability_amount": 15000,
            "installments_total": 60,
            "installments_paid": 10,
            "installment_amount": 250,
            "frequency": "monthly",
            "due_date": "2024-10-15",
            "next_due_date": "2024-10-15",
            "importance_score": 90,
            "priority": 95,
            "remaining_amount": 12500,
            "is_completed": False,
            "description": "Education loan repayment",
            "created_at": "2024-01-01T00:00:00.000Z"
        },
        {
            "id": 2,
            "user_id": 1,
            "liability_type": "Car Payment",
            "liability_amount": 5000,
            "installments_total": 20,
            "installments_paid": 10,
            "installment_amount": 250,
            "frequency": "monthly",
            "due_date": "2024-10-20",
            "next_due_date": "2024-10-20",
            "importance_score": 75,
            "priority": 88,
            "remaining_amount": 2500,
            "is_completed": False,
            "description": "Monthly car payment",
            "created_at": "2024-01-15T00:00:00.000Z"
        }
    ]
    return jsonify({"liabilities": mock_liabilities})

# ------------------- Recommendations API -------------------
@app.get("/api/recommendations")
def get_recommendations():
    """Get financial recommendations"""
    mock_recommendations = [
        {
            "id": 1,
            "user_id": 1,
            "type": "payment_priority",
            "title": "Prioritize Student Loan Payment",
            "description": "Your student loan has the highest priority. Consider paying extra $50/month to reduce interest.",
            "priority": 95,
            "amount": 250,
            "impact": "high",
            "category": "debt_management",
            "created_at": "2024-10-01T00:00:00.000Z"
        },
        {
            "id": 2,
            "user_id": 1,
            "type": "savings",
            "title": "Build Emergency Fund",
            "description": "Increase your emergency fund to 6 months of expenses ($7,200).",
            "priority": 85,
            "amount": 1700,
            "impact": "medium",
            "category": "savings",
            "created_at": "2024-10-01T00:00:00.000Z"
        }
    ]
    return jsonify({"recommendations": mock_recommendations})

# ------------------- Auth API (Basic Mock) -------------------
@app.post("/api/auth/login")
def login():
    """Basic login endpoint for demo"""
    data = request.get_json() or {}
    email = data.get("email", "")
    password = data.get("password", "")
    
    # Demo credentials
    if email == "demo@example.com" and password == "demo123":
        return jsonify({
            "message": "Login successful",
            "access_token": "demo-token-12345",
            "user": {
                "id": 1,
                "name": "Demo User",
                "email": "demo@example.com"
            }
        })
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.post("/api/auth/register")
def register():
    """Basic register endpoint for demo"""
    data = request.get_json() or {}
    return jsonify({
        "message": "Registration successful",
        "access_token": "demo-token-12345",
        "user": {
            "id": 1,
            "name": data.get("name", "Demo User"),
            "email": data.get("email", "demo@example.com")
        }
    })

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
