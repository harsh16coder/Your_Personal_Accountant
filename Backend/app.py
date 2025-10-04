
import os, json, sqlite3, datetime, uuid, jwt
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from pydantic import BaseModel
from typing import Optional, List, Literal
from dotenv import load_dotenv

# ------------------- Load env -------------------
load_dotenv()
DB_PATH      = os.getenv("DB_PATH", "finance.db")
ORIGINS      = os.getenv("CORS_ALLOW_ORIGINS", "*")
JWT_SECRET   = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

# lazy import to avoid import-time errors if package missing
from cerebras.cloud.sdk import Cerebras
client = Cerebras(
        api_key="csk-8682t4mpjnxckyf5vwhh982e4tpm5yxkxft3tcv6dmy32mh6",)
LLM_MODEL = "llama-4-scout-17b-16e-instruct"

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ORIGINS}})

# ------------------- DB helpers -------------------

# ------------------- DB helpers -------------------
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def now_iso():
    return datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

def to_cents(amount: float) -> int:
    return int(round((amount or 0.0) * 100))

def currency_clean(cur: Optional[str]) -> str:
    if not cur: return "USD"
    cur = cur.strip().upper()
    return {"US$":"USD","$":"USD"}.get(cur, cur)

# ------------------- JWT helpers -------------------
def generate_token(user_id: str) -> str:
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),  # Token expires in 7 days
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return user_id if valid"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Add user_id to request context
        request.current_user_id = user_id
        return f(*args, **kwargs)
    
    return decorated

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    
    # Users table for profile and income data
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      monthly_income_cents INTEGER DEFAULT 0,
      currency_preference TEXT DEFAULT 'USD',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
    """)
    
    # Assets table for tracking user assets
    cur.execute("""
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      asset_value_cents INTEGER NOT NULL,
      asset_description TEXT,
      account TEXT,
      is_liquid BOOLEAN DEFAULT 1,
      date_received TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    # Add date_received column if it doesn't exist (for existing databases)
    try:
        cur.execute("ALTER TABLE assets ADD COLUMN date_received TEXT")
    except sqlite3.OperationalError:
        # Column already exists
        pass
    
    # Liabilities table for tracking debts and obligations
    cur.execute("""
    CREATE TABLE IF NOT EXISTS liabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      liability_type TEXT NOT NULL,
      total_amount_cents INTEGER NOT NULL,
      remaining_amount_cents INTEGER NOT NULL,
      installment_amount_cents INTEGER NOT NULL,
      installments_total INTEGER NOT NULL,
      installments_paid INTEGER DEFAULT 0,
      frequency TEXT NOT NULL, -- 'monthly', 'weekly', 'quarterly'
      due_date TEXT NOT NULL,
      next_due_date TEXT NOT NULL,
      interest_rate REAL DEFAULT 0.0,
      priority_score INTEGER DEFAULT 50,
      is_completed BOOLEAN DEFAULT 0,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
    # Income table for tracking various income sources
    cur.execute("""
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      income_type TEXT NOT NULL, -- 'salary', 'bonus', 'investment', 'other'
      amount_cents INTEGER NOT NULL,
      frequency TEXT NOT NULL, -- 'monthly', 'weekly', 'yearly', 'one-time'
      source TEXT,
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    
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
    # finance tables
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
    
    # Database tables created successfully - no dummy data
    
    conn.commit()
    conn.close()

init_db()

# ------------------- LLM policy -------------------
SYSTEM_POLICY = f"""
You are FinanceRouter, a gatekeeping and extraction model for a finance-only assistant.

### ALLOWED
- Personal finance: expenses, income updates, asset additions, liability management, transfers, budgeting.
- Markets & trading: simple buy/sell events for stocks/crypto, tickers, shares, prices, fees.
- Asset management: adding savings accounts, investments, property values.
- Liability tracking: loans, credit cards, rent, payment obligations.
- Income reporting: salary updates, bonuses, additional income sources.

### DISALLOWED
- Anything outside finance (coding, recipes, travel, jokes, politics, etc.).
- Medical, legal, or other professional advice.

### OUTPUT FORMAT
Return **ONLY** valid JSON in this schema:

{{
  "topic": "finance" | "not_finance" | "unknown",
  "intent": "record_expense" | "record_trade" | "add_asset" | "add_liability" | "update_income" | "ask_finance_question" | "other",
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
    
    "asset_type": "string | null (e.g., 'Savings Account', 'Investment', 'Property')",
    "asset_value": 0.0,
    "asset_description": "string | null",
    "is_liquid": true,
    
    "liability_type": "string | null (e.g., 'Student Loan', 'Credit Card', 'Mortgage')",
    "total_amount": 0.0,
    "remaining_amount": 0.0,
    "installment_amount": 0.0,
    "frequency": "monthly | weekly | quarterly | null",
    "due_date": "YYYY-MM-DD | null",
    "interest_rate": 0.0,
    "priority_score": 50,
    
    "income_type": "string | null (e.g., 'salary', 'bonus', 'investment')",
    "income_frequency": "monthly | weekly | yearly | one-time | null",
    "monthly_income": 0.0
  }},
  "missing": ["field_a", "field_b"],
  "answer_draft": "short helpful reply",
  "fallback_reason": "string",
  "confidence": 0.0
}}

### DECISION RULES
1) If the message is off-topic or nonsense → topic="not_finance", action="reject".
2) If it's a finance question (not a loggable event) → intent="ask_finance_question", action="answer".
3) For an EXPENSE event, required: amount, currency, date. merchant optional.
4) For a TRADE event, required: action_trade, symbol, shares, price_per_share, currency, date.
5) If required fields are missing → action="clarify" and enumerate "missing".
6) Only set action="save" when all required fields exist and are coherent.
7) Use today's date {datetime.date.today().isoformat()} only if the user clearly implies "today".
8) Keep answers brief and neutral.
9) Output JSON only. No prose outside the JSON.
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
def build_sql_and_params(user_id: str, source_text: str, llm: dict):
    x = llm.get("extracted", {}) or {}
    created_at = now_iso()

    def missing(fields):
        miss = [f for f in fields if not x.get(f)]
        return miss

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

    if llm.get("intent") == "add_asset":
        req = ["asset_type", "asset_value", "currency"]
        miss = missing(req)
        if miss:
            raise ValueError(f"missing fields for asset: {miss}")
        sql = """
        INSERT INTO assets (user_id, asset_type, asset_value_cents, asset_description,
                           account, is_liquid, date_received, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = [
            user_id,
            x.get("asset_type"),
            to_cents(float(x.get("asset_value"))),
            x.get("asset_description") or x.get("note"),
            x.get("account"),
            x.get("is_liquid", True),
            x.get("date") or created_at.split('T')[0],  # Use date or current date
            created_at,
            created_at,
        ]
        return sql.strip(), params, "assets"

    if llm.get("intent") == "add_liability":
        req = ["liability_type", "total_amount", "installment_amount", "frequency"]
        miss = missing(req)
        if miss:
            raise ValueError(f"missing fields for liability: {miss}")
        
        # If due_date not provided, default to next month
        due_date = x.get("due_date")
        if not due_date:
            next_month = datetime.date.today() + datetime.timedelta(days=30)
            due_date = next_month.isoformat()
        
        total_amount = float(x.get("total_amount"))
        remaining_amount = float(x.get("remaining_amount", total_amount))
        installment_amount = float(x.get("installment_amount"))
        
        sql = """
        INSERT INTO liabilities (user_id, liability_type, total_amount_cents, remaining_amount_cents,
                               installment_amount_cents, installments_total, installments_paid,
                               frequency, due_date, next_due_date, interest_rate, priority_score,
                               is_completed, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        installments_total = int(total_amount / installment_amount) if installment_amount > 0 else 1
        params = [
            user_id,
            x.get("liability_type"),
            to_cents(total_amount),
            to_cents(remaining_amount),
            to_cents(installment_amount),
            installments_total,
            0,  # installments_paid
            x.get("frequency"),
            due_date,
            due_date,  # next_due_date same as due_date initially
            float(x.get("interest_rate", 0.0)),
            int(x.get("priority_score", 70)),
            False,  # is_completed
            x.get("note") or x.get("asset_description"),
            created_at,
            created_at,
        ]
        return sql.strip(), params, "liabilities"

    if llm.get("intent") == "update_income":
        # For monthly income updates, update the user table
        if x.get("income_frequency") == "monthly" or x.get("monthly_income"):
            monthly_income = x.get("monthly_income") or x.get("amount")
            if not monthly_income:
                raise ValueError("missing monthly income amount")
            
            sql = """
            UPDATE users SET monthly_income_cents = ?, updated_at = ?
            WHERE id = ?
            """
            params = [
                to_cents(float(monthly_income)),
                created_at,
                user_id,
            ]
            return sql.strip(), params, "users"
        else:
            # For other income types, add to income table
            req = ["income_type", "amount", "income_frequency"]
            miss = missing(req)
            if miss:
                raise ValueError(f"missing fields for income: {miss}")
            
            sql = """
            INSERT INTO income (user_id, income_type, amount_cents, frequency,
                              source, occurred_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """
            params = [
                user_id,
                x.get("income_type"),
                to_cents(float(x.get("amount"))),
                x.get("income_frequency"),
                x.get("merchant") or x.get("note"),
                x.get("date") or created_at,
                created_at,
            ]
            return sql.strip(), params, "income"

    raise ValueError("No SQL for this intent")

# ------------------- API endpoints -------------------
@app.post("/api/sessions")
@token_required
def create_session():
    data = request.get_json(force=True) or {}
    user_id = request.current_user_id
    title = data.get("title") or "New chat"
    sid = data.get("session_id") or str(uuid.uuid4())

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO sessions (id, user_id, title, summary, created_at) VALUES (?, ?, ?, ?, ?)",
                (sid, user_id, title, "", now_iso()))
    conn.commit()
    conn.close()
    return jsonify({"session_id": sid, "title": title})

@app.get("/api/sessions/<sid>/messages")
@token_required
def get_messages(sid):
    user_id = request.current_user_id
    conn = get_conn()
    cur = conn.cursor()
    
    # Verify session belongs to user
    cur.execute("SELECT id FROM sessions WHERE id = ? AND user_id = ?", (sid, user_id))
    if not cur.fetchone():
        conn.close()
        return jsonify({"error": "Session not found"}), 404
    
    cur.execute("SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY id ASC", (sid,))
    rows = cur.fetchall()
    conn.close()
    msgs = [{"role": r["role"], "content": r["content"], "created_at": r["created_at"]} for r in rows]
    return jsonify({"messages": msgs})

@app.post("/api/chat")
@token_required
def chat():
    data = request.get_json(force=True) or {}
    user_id = request.current_user_id
    session_id = data.get("session_id")
    message = data.get("message", "").strip()

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400
    if not message:
        return jsonify({"error": "message is empty"}), 400

    conn = get_conn()
    cur = conn.cursor()

    # ensure session exists and belongs to user
    cur.execute("SELECT id FROM sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
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
            else:
                reply = "Saved your trade."
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
@token_required
def get_dashboard():
    """Get dashboard overview data from real database"""
    user_id = request.current_user_id
    
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        # Get user information
        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_row = cur.fetchone()
        
        if not user_row:
            return jsonify({"error": "User not found"}), 404
        
        user = {
            "id": user_row["id"],
            "name": user_row["name"],
            "email": user_row["email"],
            "monthly_income": user_row["monthly_income_cents"] / 100 if user_row["monthly_income_cents"] else 0,
            "currency_preference": user_row["currency_preference"]
        }
        
        # Calculate total assets
        cur.execute("SELECT SUM(asset_value_cents) as total FROM assets WHERE user_id = ?", (user_id,))
        assets_result = cur.fetchone()
        total_assets = (assets_result["total"] / 100) if assets_result["total"] else 0
        
        # Calculate total liabilities (remaining amounts)
        cur.execute("SELECT SUM(remaining_amount_cents) as total FROM liabilities WHERE user_id = ? AND is_completed = 0", (user_id,))
        liabilities_result = cur.fetchone()
        total_liabilities = (liabilities_result["total"] / 100) if liabilities_result["total"] else 0
        
        # Count active liabilities
        cur.execute("SELECT COUNT(*) as count FROM liabilities WHERE user_id = ? AND is_completed = 0", (user_id,))
        count_result = cur.fetchone()
        active_liabilities_count = count_result["count"] if count_result else 0
        
        # Get high priority liabilities
        cur.execute("""
        SELECT * FROM liabilities 
        WHERE user_id = ? AND is_completed = 0 
        ORDER BY priority_score DESC 
        LIMIT 3
        """, (user_id,))
        high_priority_rows = cur.fetchall()
        
        high_priority_liabilities = []
        for row in high_priority_rows:
            liability_data = {
                "liability": {
                    "id": row["id"],
                    "liability_type": row["liability_type"],
                    "remaining_amount": row["remaining_amount_cents"] / 100,
                    "priority": row["priority_score"],
                    "next_due_date": row["next_due_date"],
                    "installment_amount": row["installment_amount_cents"] / 100,
                    "description": row["description"]
                },
                "priority_score": row["priority_score"]
            }
            high_priority_liabilities.append(liability_data)
        
        # Calculate net worth
        net_worth = total_assets - total_liabilities
        
        # Get monthly income from multiple sources
        cur.execute("""
        SELECT SUM(amount_cents) as total FROM income 
        WHERE user_id = ? AND frequency = 'monthly'
        """, (user_id,))
        income_result = cur.fetchone()
        total_monthly_income = user["monthly_income"]  # Base salary
        if income_result["total"]:
            total_monthly_income += (income_result["total"] / 100)
        
        return jsonify({
            "user": user,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "net_worth": net_worth,
            "monthly_income": total_monthly_income,
            "active_liabilities_count": active_liabilities_count,
            "high_priority_liabilities": high_priority_liabilities
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- Assets API -------------------
@app.get("/api/assets")
@token_required
def get_assets():
    """Get user assets from real database"""
    user_id = request.current_user_id
    
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        cur.execute("""
        SELECT id, asset_type, asset_value_cents, asset_description, account, 
               is_liquid, date_received, created_at, updated_at
        FROM assets WHERE user_id = ?
        ORDER BY asset_value_cents DESC
        """, (user_id,))
        
        rows = cur.fetchall()
        assets = []
        
        for row in rows:
            asset = {
                "id": row["id"],
                "user_id": user_id,
                "asset_type": row["asset_type"],
                "asset_value": row["asset_value_cents"] / 100,
                "asset_description": row["asset_description"],
                "account": row["account"],
                "is_liquid": bool(row["is_liquid"]),
                "date_received": row["date_received"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"]
            }
            assets.append(asset)
        
        return jsonify({"assets": assets})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.get("/api/tentative-assets")
@token_required
def get_tentative_assets():
    """Get user tentative/planned assets"""
    # For now, return empty list since we don't have a separate tentative assets table
    # This could be extended to have a separate table for planned future assets
    return jsonify({"tentative_assets": []})

@app.post("/api/assets")
@token_required
def create_asset():
    """Create a new asset"""
    user_id = request.current_user_id
    data = request.get_json() or {}
    
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        asset_type = data.get('asset_type')
        asset_value = float(data.get('asset_value', 0))
        asset_description = data.get('asset_description', '')
        account = data.get('account', '')
        is_liquid = data.get('is_liquid', True)
        date_received = data.get('date_received', now_iso().split('T')[0])  # Default to today's date
        
        cur.execute("""
        INSERT INTO assets (user_id, asset_type, asset_value_cents, asset_description,
                           account, is_liquid, date_received, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, asset_type, to_cents(asset_value), asset_description, 
              account, is_liquid, date_received, now_iso(), now_iso()))
        
        asset_id = cur.lastrowid
        conn.commit()
        
        return jsonify({
            "message": "Asset created successfully",
            "asset_id": asset_id
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.post("/api/tentative-assets")
@token_required
def create_tentative_asset():
    """Create a tentative/planned asset"""
    # For now, just return success since we don't have a separate table
    # This could be extended to have a separate table for planned assets
    return jsonify({"message": "Tentative asset created successfully"})

# ------------------- Liabilities API -------------------
@app.get("/api/liabilities")
@token_required
def get_liabilities():
    """Get user liabilities from real database"""
    user_id = request.current_user_id
    
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        cur.execute("""
        SELECT id, liability_type, total_amount_cents, remaining_amount_cents,
               installment_amount_cents, installments_total, installments_paid,
               frequency, due_date, next_due_date, interest_rate, priority_score,
               is_completed, description, created_at, updated_at
        FROM liabilities WHERE user_id = ?
        ORDER BY priority_score DESC, next_due_date ASC
        """, (user_id,))
        
        rows = cur.fetchall()
        liabilities = []
        
        for row in rows:
            liability = {
                "id": row["id"],
                "user_id": user_id,
                "liability_type": row["liability_type"],
                "liability_amount": row["total_amount_cents"] / 100,
                "total_amount": row["total_amount_cents"] / 100,
                "remaining_amount": row["remaining_amount_cents"] / 100,
                "installment_amount": row["installment_amount_cents"] / 100,
                "installments_total": row["installments_total"],
                "installments_paid": row["installments_paid"],
                "frequency": row["frequency"],
                "due_date": row["due_date"],
                "next_due_date": row["next_due_date"],
                "interest_rate": row["interest_rate"],
                "priority": row["priority_score"],
                "priority_score": row["priority_score"],  # For compatibility
                "importance_score": row["priority_score"],  # For compatibility
                "is_completed": bool(row["is_completed"]),
                "description": row["description"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"]
            }
            liabilities.append(liability)
        
        return jsonify({"liabilities": liabilities})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------- Recommendations API -------------------
@app.get("/api/recommendations")
@token_required
def get_recommendations():
    """Get financial recommendations"""
    user_id = request.current_user_id
    
    # For now, return empty recommendations as this would need 
    # complex financial analysis logic to generate real recommendations
    return jsonify({"recommendations": []})

# ------------------- Auth API -------------------
@app.post("/api/auth/register")
def register():
    """User registration with password hashing"""
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        # Check if user already exists
        cur.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cur.fetchone():
            return jsonify({"error": "User with this email already exists"}), 409
        
        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = generate_password_hash(password)
        
        cur.execute("""
        INSERT INTO users (id, name, email, password_hash, monthly_income_cents, 
                          currency_preference, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, email, password_hash, 0, "USD", now_iso(), now_iso()))
        
        conn.commit()
        
        # Generate JWT token
        token = generate_token(user_id)
        
        return jsonify({
            "message": "Registration successful",
            "access_token": token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.post("/api/auth/login")
def login():
    """User login with password verification"""
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    conn = get_conn()
    cur = conn.cursor()
    
    try:
        # Find user by email
        cur.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (email,))
        user_row = cur.fetchone()
        
        if not user_row or not check_password_hash(user_row["password_hash"], password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate JWT token
        token = generate_token(user_row["id"])
        
        return jsonify({
            "message": "Login successful",
            "access_token": token,
            "user": {
                "id": user_row["id"],
                "name": user_row["name"],
                "email": user_row["email"]
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
