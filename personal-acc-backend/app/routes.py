from flask import Blueprint, request, jsonify
from datetime import datetime, date, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Asset, FutureAsset, Liability, LiabilityInstallment, ChatHistory
from . import db

main_bp = Blueprint("main", __name__)

# ------------------ Assets ------------------
@main_bp.route('/assets', methods=['POST'])
@jwt_required()
def create_asset():
    user_id = get_jwt_identity()
    data = request.json
    name = data.get('asset_name')
    value = data.get('asset_value')
    date_received = data.get('date_received')

    if not value:
        return jsonify({'message': 'asset_value required'}), 400

    if date_received:
        date_received = datetime.strptime(date_received, '%Y-%m-%d').date()

    asset = Asset(user_id=user_id, asset_name=name, asset_value=value, date_received=date_received)
    db.session.add(asset)
    db.session.commit()
    return jsonify({'id': asset.id}), 201


@main_bp.route('/assets', methods=['GET'])
@jwt_required()
def list_assets():
    user_id = get_jwt_identity()
    assets = Asset.query.filter_by(user_id=user_id).all()
    out = [{'id': a.id, 'asset_name': a.asset_name, 'asset_value': float(a.asset_value),
            'date_received': a.date_received.isoformat() if a.date_received else None} for a in assets]
    return jsonify(out)


# ------------------ Future Assets ------------------
@main_bp.route('/future_assets', methods=['POST'])
@jwt_required()
def create_future_asset():
    user_id = get_jwt_identity()
    data = request.json
    name = data.get('asset_name')
    amount = data.get('asset_amount')
    expected_date = data.get('expected_date')

    if not (amount and expected_date):
        return jsonify({'message': 'asset_amount and expected_date required'}), 400

    expected_date = datetime.strptime(expected_date, '%Y-%m-%d').date()
    fa = FutureAsset(user_id=user_id, asset_name=name, asset_amount=amount, expected_date=expected_date)
    db.session.add(fa)
    db.session.commit()
    return jsonify({'id': fa.id}), 201


@main_bp.route('/future_assets', methods=['GET'])
@jwt_required()
def list_future_assets():
    user_id = get_jwt_identity()
    items = FutureAsset.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': i.id, 'asset_name': i.asset_name, 'asset_amount': float(i.asset_amount),
                     'expected_date': i.expected_date.isoformat()} for i in items])


# ------------------ Liabilities & Installments ------------------
@main_bp.route('/liabilities', methods=['POST'])
@jwt_required()
def create_liability():
    user_id = get_jwt_identity()
    data = request.json
    name = data.get('liability_name')
    total_amount = data.get('total_amount')
    importance_score = data.get('importance_score', 50)
    installments_total = data.get('installments_total', 1)
    frequency = data.get('frequency', 'one-time')
    next_due_date = data.get('next_due_date')

    if not (name and total_amount and next_due_date):
        return jsonify({'message': 'liability_name, total_amount and next_due_date required'}), 400

    next_due_date = datetime.strptime(next_due_date, '%Y-%m-%d').date()
    liability = Liability(user_id=user_id, liability_name=name, total_amount=total_amount,
                          importance_score=importance_score, installments_total=installments_total,
                          frequency=frequency, next_due_date=next_due_date)
    db.session.add(liability)
    db.session.commit()

    # create installments
    try:
        amt = float(total_amount) / int(installments_total)
    except Exception:
        amt = float(total_amount)

    installments = []
    base_date = next_due_date
    for i in range(1, int(installments_total) + 1):
        due = base_date
        if i > 1:
            if frequency == 'monthly':
                due = add_months(base_date, i - 1)
            elif frequency == 'quarterly':
                due = add_months(base_date, 3 * (i - 1))
            elif frequency == 'yearly':
                due = date(base_date.year + (i - 1), base_date.month, base_date.day)
        inst = LiabilityInstallment(liability_id=liability.id, user_id=user_id,
                                    installment_no=i, amount=amt, due_date=due)
        installments.append(inst)
    db.session.add_all(installments)
    db.session.commit()

    return jsonify({'liability_id': liability.id}), 201


@main_bp.route('/liabilities', methods=['GET'])
@jwt_required()
def list_liabilities():
    user_id = get_jwt_identity()
    items = Liability.query.filter_by(user_id=user_id).all()
    out = []
    for l in items:
        out.append({
            'id': l.id,
            'name': l.liability_name,
            'total_amount': float(l.total_amount),
            'importance_score': l.importance_score,
            'installments_total': l.installments_total,
            'next_due_date': l.next_due_date.isoformat() if l.next_due_date else None
        })
    return jsonify(out)


@main_bp.route('/liabilities/<int:lid>/installments', methods=['GET'])
@jwt_required()
def get_installments(lid):
    user_id = get_jwt_identity()
    items = LiabilityInstallment.query.filter_by(liability_id=lid, user_id=user_id).order_by(
        LiabilityInstallment.installment_no).all()
    return jsonify([{'id': it.id, 'installment_no': it.installment_no,
                     'amount': float(it.amount),
                     'due_date': it.due_date.isoformat(),
                     'paid': it.paid} for it in items])


@main_bp.route('/liabilities/<int:lid>/pay', methods=['POST'])
@jwt_required()
def pay_installment(lid):
    user_id = get_jwt_identity()
    data = request.json
    installment_no = data.get('installment_no')
    if installment_no is None:
        return jsonify({'message': 'installment_no required'}), 400
    inst = LiabilityInstallment.query.filter_by(liability_id=lid,
                                                installment_no=installment_no,
                                                user_id=user_id).first()
    if not inst:
        return jsonify({'message': 'installment not found'}), 404
    if inst.paid:
        return jsonify({'message': 'already paid'}), 400
    inst.paid = True
    inst.paid_at = datetime.utcnow()
    liability = Liability.query.get(lid)
    liability.installments_done = (liability.installments_done or 0) + 1
    db.session.commit()
    return jsonify({'message': 'paid'}), 200


# ------------------ Chat ------------------
@main_bp.route('/chat/message', methods=['POST'])
@jwt_required()
def chat_message():
    user_id = get_jwt_identity()
    data = request.json
    message = data.get('message')
    role = data.get('role', 'user')
    if not message:
        return jsonify({'message': 'message required'}), 400
    ch = ChatHistory(user_id=user_id, message=message, role=role)
    db.session.add(ch)
    db.session.commit()

    assistant_reply = f"(LLM stub) I heard: {message}"
    ch2 = ChatHistory(user_id=user_id, message=assistant_reply, role='assistant')
    db.session.add(ch2)
    db.session.commit()
    return jsonify({'reply': assistant_reply})


@main_bp.route('/chat/history', methods=['GET'])
@jwt_required()
def chat_history():
    user_id = get_jwt_identity()
    items = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.created_at).all()
    return jsonify([{'id': c.id, 'role': c.role, 'message': c.message,
                     'created_at': c.created_at.isoformat()} for c in items])


# ------------------ Recommendation ------------------
@main_bp.route('/recommendation', methods=['GET'])
@jwt_required()
def recommendation():
    user_id = get_jwt_identity()
    rec = compute_recommendation(user_id, horizon_days=60)
    return jsonify(rec)


# ------------------ Utility functions ------------------
def add_months(orig_date, months):
    year = orig_date.year + (orig_date.month + months - 1) // 12
    month = (orig_date.month + months - 1) % 12 + 1
    day = min(orig_date.day, 28)
    return date(year, month, day)


def compute_recommendation(user_id, horizon_days=60):
    today = date.today()
    horizon = today + timedelta(days=horizon_days)

    # assets
    assets = Asset.query.filter(Asset.user_id == user_id).all()
    starting_balance = 0.0
    for a in assets:
        if a.date_received is None or a.date_received <= today:
            starting_balance += float(a.asset_value)

    # future assets
    future_assets = FutureAsset.query.filter(FutureAsset.user_id == user_id,
                                             FutureAsset.expected_date <= horizon).all()
    future_by_date = {}
    for fa in future_assets:
        future_by_date.setdefault(fa.expected_date, 0.0)
        future_by_date[fa.expected_date] += float(fa.asset_amount)

    # installments
    installments = LiabilityInstallment.query.join(
        Liability, LiabilityInstallment.liability_id == Liability.id
    ).filter(
        LiabilityInstallment.user_id == user_id,
        LiabilityInstallment.paid == False,
        LiabilityInstallment.due_date <= horizon
    ).all()

    by_date = {}
    for it in installments:
        liab = Liability.query.get(it.liability_id)
        by_date.setdefault(it.due_date, []).append({
            'inst': it,
            'importance': liab.importance_score,
            'liability_name': liab.liability_name
        })

    schedule = []
    available = starting_balance
    notes = []
    day = today
    while day <= horizon:
        if day in future_by_date:
            available += future_by_date[day]
        if day in by_date:
            items = sorted(by_date[day], key=lambda x: -x['importance'])
            paid_items = []
            for entry in items:
                amt = float(entry['inst'].amount)
                name = entry['liability_name']
                if available >= amt:
                    available -= amt
                    paid_items.append({'liability': name, 'amount': amt})
                else:
                    notes.append(f"Insufficient funds to pay {name} on {day.isoformat()}")
            if paid_items:
                schedule.append({'date': day.isoformat(), 'items': paid_items})
        day += timedelta(days=1)

    expected_savings = available
    return {'schedule': schedule, 'expected_savings': expected_savings, 'notes': notes}