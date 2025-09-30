from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_jwt_extended import create_access_token
from .models import User
from . import db

auth_bp = Blueprint("auth", __name__)

def create_jwt(identity):
    return create_access_token(identity=identity)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    currency_pref = data.get('currency_pref', 'INR')

    if not (username and email and password):
        return jsonify({'message': 'username, email and password required'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'user already exists'}), 400

    pwd_hash = generate_password_hash(password)
    secret_key = generate_password_hash(username + str(datetime.utcnow()))
    user = User(username=username, email=email, password_hash=pwd_hash,
                secret_key=secret_key, name=name, currency_pref=currency_pref)
    db.session.add(user)
    db.session.commit()

    token = create_jwt(user.id)
    return jsonify({'token': token, 'secret_key': secret_key}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not (username and password):
        return jsonify({'message': 'username and password required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'invalid credentials'}), 401

    token = create_jwt(user.id)
    return jsonify({'token': token}), 200

@auth_bp.route('/reset', methods=['POST'])
def reset_password():
    data = request.json
    username = data.get('username')
    secret_key = data.get('secret_key')
    new_password = data.get('new_password')

    if not (username and secret_key and new_password):
        return jsonify({'message': 'username, secret_key and new_password required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'message': 'user not found'}), 404

    if not check_password_hash(user.secret_key, secret_key):
        return jsonify({'message': 'invalid secret_key'}), 401

    user.password_hash = generate_password_hash(new_password)
    user.secret_key = generate_password_hash(username + str(datetime.utcnow()))
    db.session.commit()
    return jsonify({'message': 'password reset successful'}), 200