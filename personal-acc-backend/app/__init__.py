from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    # import and register blueprints
    from .auth import auth_bp
    from .routes import main_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(main_bp, url_prefix="/api")

    return app