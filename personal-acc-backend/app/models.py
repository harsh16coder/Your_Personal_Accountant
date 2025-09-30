from datetime import datetime
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    secret_key = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(120))
    currency_pref = db.Column(db.String(10), default="INR")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Asset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    asset_name = db.Column(db.String(255))
    asset_value = db.Column(db.Numeric(15, 2), nullable=False)
    date_received = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FutureAsset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    asset_name = db.Column(db.String(255))
    asset_amount = db.Column(db.Numeric(15, 2), nullable=False)
    expected_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Liability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    liability_name = db.Column(db.String(255), nullable=False)
    total_amount = db.Column(db.Numeric(15, 2), nullable=False)
    importance_score = db.Column(db.SmallInteger, nullable=False)
    installments_total = db.Column(db.Integer, default=1)
    installments_done = db.Column(db.Integer, default=0)
    frequency = db.Column(db.String(16))
    next_due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class LiabilityInstallment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    liability_id = db.Column(db.Integer, db.ForeignKey('liability.id', ondelete='CASCADE'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    installment_no = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    paid = db.Column(db.Boolean, default=False)
    paid_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AssetInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id', ondelete='CASCADE'))
    asset_type = db.Column(db.String(100))

class LiabilityInfo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    liability_id = db.Column(db.Integer, db.ForeignKey('liability.id', ondelete='CASCADE'))
    liability_type = db.Column(db.String(100))

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    message = db.Column(db.Text)
    role = db.Column(db.String(10))  # 'user' or 'assistant' or 'system'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)