from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = Flask(
    __name__,
    instance_relative_config=True,
    template_folder=str(FRONTEND_DIR),
    static_folder=str(FRONTEND_DIR),
    static_url_path="/static",
)


app.config["SECRET_KEY"] = "change-this-secret-key-for-local-demo"
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{BASE_DIR / 'instance' / 'tma.sqlite3'}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "jwt-secret-change-for-local-demo"


# Default Admin credentials
app.config["ADMIN_EMAIL"] = "admin@gmail.com"
app.config["ADMIN_PASSWORD"] = "Admin@123"
app.config["ADMIN_NAME"] = "System Admin"

# Initialize extensions
db.init_app(app)
CORS(app)
JWTManager(app)


# ---- Authentication Routes ----

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    contact = data.get("contact")

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required"}), 400

    email = email.strip().lower()
    if "@" not in email:
        return jsonify({"message": "Invalid email format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email is already registered"}), 400

    # User registration is for Trekker (USER) role only
    hashed_password = generate_password_hash(password)
    user = User(
        name=name.strip(),
        email=email,
        password_hash=hashed_password,
        role="USER",
        contact=contact.strip() if contact else None,
        is_active=True,
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"message": "This account is deactivated"}), 403

    if user.is_blacklisted:
        return jsonify({"message": "This account is blacklisted"}), 403

    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    return jsonify({
        "access_token": access_token,
        "role": user.role,
        "name": user.name
    }), 200


@app.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.query.filter_by(id=current_user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "contact": user.contact,
        "is_active": user.is_active,
        "is_blacklisted": user.is_blacklisted,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }), 200



@app.route("/")
def serve_index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
