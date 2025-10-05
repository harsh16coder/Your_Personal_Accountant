# Enhanced chat endpoint with asset balance checking and expense deduction
# This replaces the existing /api/chat endpoint in app.py

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
        
        # Special message for missing payment method
        if "account" in missing:
            reply = f"To record this expense, I need to know how you paid for it. Please specify the payment method (e.g., 'with cash', 'using my credit card', 'from my checking account', etc.)."
        else:
            reply = f"To record this, I still need: {need}. Please provide them."

    elif llm_json.get("action") == "save":
        try:
            sql, params, table = build_sql_and_params(user_id, message, llm_json)
            
            # Special handling for expenses - check asset balance before saving
            if table == "expenses" and llm_json.get("intent") == "record_expense":
                extracted = llm_json.get("extracted", {})
                account_name = extracted.get("account")
                expense_amount = float(extracted.get("amount", 0))
                expense_amount_cents = to_cents(expense_amount)
                
                # Check if user has sufficient balance in the specified asset
                balance_ok, result = check_asset_balance(user_id, account_name, expense_amount_cents, cur)
                
                if not balance_ok:
                    # Insufficient funds or asset not found
                    status = "rejected"
                    reply = result  # Error message
                else:
                    # Sufficient funds - record expense and deduct from asset
                    cur.execute(sql, params)
                    rid = cur.lastrowid
                    conn.commit()
                    
                    # Deduct from asset
                    asset = result  # Asset object returned from check_asset_balance
                    deduct_from_asset(asset["id"], expense_amount_cents, cur)
                    conn.commit()
                    
                    status = "saved"
                    asset_name = asset["asset_type"] or asset["account"] or "your account"
                    new_balance = (asset["asset_value_cents"] - expense_amount_cents) / 100
                    reply = f"✅ Recorded ${expense_amount:.2f} expense and deducted from {asset_name}. New balance: ${new_balance:.2f}"
                    meta["record_id"] = rid
                    meta["table"] = table
                    meta["asset_updated"] = asset["id"]
                    meta["new_balance"] = new_balance
            else:
                # For non-expense records, use original logic
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
            reply = f"I'm missing details to save this: {e}"

    # save assistant message
    cur.execute("INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (session_id, "assistant", reply, now_iso()))
    conn.commit()
    conn.close()

    return jsonify({"status": status, "reply": reply, "meta": meta})