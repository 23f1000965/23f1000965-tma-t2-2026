from datetime import datetime
from functools import wraps
from pathlib import Path

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User, Trek, Booking, StaffAssignment

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

# Instantiate Flask application globally
app = Flask(
    __name__,
    instance_relative_config=True,
    template_folder=str(FRONTEND_DIR),
    static_folder=str(FRONTEND_DIR),
    static_url_path="/static",
)

# Configure the application directly
app.config["SECRET_KEY"] = "trekking-management-system-secret-key-2026"
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{BASE_DIR / 'instance' / 'tma.sqlite3'}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key-for-tms-jwt-authentication-2026"


# Default Admin credentials
app.config["ADMIN_EMAIL"] = "admin@gmail.com"
app.config["ADMIN_PASSWORD"] = "Admin@123"
app.config["ADMIN_NAME"] = "System Admin"

# Initialize extensions
db.init_app(app)
CORS(app)
JWTManager(app)


# ---- Decorator to enforce Admin-only route access ----
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "ADMIN":
                return jsonify({"message": "Admin access required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


# ---- Decorator to enforce Staff-only route access ----
def staff_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != "STAFF":
                return jsonify({"message": "Staff access required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


# ---- Authentication Routes ----
#trekker register
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

#login for all users (Admin, Staff, Trekker)
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

# user profile 
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


# ---- Admin Management Routes----
# Admin dashboard stats 
@app.route("/api/admin/dashboard-stats", methods=["GET"])
@admin_required()
def get_dashboard_stats():
    total_treks = Trek.query.count()
    total_staff = User.query.filter_by(role="STAFF").count()
    total_trekkers = User.query.filter_by(role="USER").count()
    total_bookings = Booking.query.count()

    return jsonify({
        "total_treks": total_treks,
        "total_staff": total_staff,
        "total_trekkers": total_trekkers,
        "total_bookings": total_bookings
    }), 200

# admin get all treks 
@app.route("/api/admin/treks", methods=["GET"])
@admin_required()
def list_treks():
    treks = Trek.query.all()
    return jsonify([trek.to_dict() for trek in treks]), 200

# admin create new trek 
@app.route("/api/admin/treks", methods=["POST"])
@admin_required()
def create_trek():
    data = request.get_json() or {}
    name = data.get("name")
    location = data.get("location")
    difficulty = data.get("difficulty")
    duration_days = data.get("duration_days")
    available_slots = data.get("available_slots")
    start_date_str = data.get("start_date")
    end_date_str = data.get("end_date")
    description = data.get("description")
    assigned_staff_id = data.get("assigned_staff_id")

    if not name or not location or not difficulty or not duration_days or not available_slots or not start_date_str or not end_date_str:
        return jsonify({"message": "Missing required fields"}), 400

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

    if difficulty not in ["EASY", "MODERATE", "HARD"]:
        return jsonify({"message": "Difficulty must be EASY, MODERATE, or HARD"}), 400

    trek = Trek(
        name=name.strip(),
        location=location.strip(),
        difficulty=difficulty,
        duration_days=int(duration_days),
        available_slots=int(available_slots),
        start_date=start_date,
        end_date=end_date,
        description=description.strip() if description else None,
        assigned_staff_id=int(assigned_staff_id) if assigned_staff_id else None,
        status="PENDING",
    )
    db.session.add(trek)
    db.session.commit()

    if assigned_staff_id:
        assignment = StaffAssignment(
            staff_id=int(assigned_staff_id),
            trek_id=trek.id
        )
        db.session.add(assignment)
        db.session.commit()

    return jsonify({"message": "Trek created successfully", "trek": trek.to_dict()}), 201

# admin get trek by id 
@app.route("/api/admin/treks/<int:trek_id>", methods=["GET"])
@admin_required()
def get_trek(trek_id):
    trek = Trek.query.filter_by(id=trek_id).first()
    if not trek:
        return jsonify({"message": "Trek not found"}), 404
    return jsonify(trek.to_dict()), 200

#admin update trek by id 
@app.route("/api/admin/treks/<int:trek_id>", methods=["PUT"])
@admin_required()
def update_trek(trek_id):
    trek = Trek.query.filter_by(id=trek_id).first()
    if not trek:
        return jsonify({"message": "Trek not found"}), 404

    data = request.get_json() or {}
    trek.name = data.get("name", trek.name).strip()
    trek.location = data.get("location", trek.location).strip()
    trek.difficulty = data.get("difficulty", trek.difficulty)
    trek.duration_days = int(data.get("duration_days", trek.duration_days))
    trek.available_slots = int(data.get("available_slots", trek.available_slots))
    trek.description = data.get("description", trek.description).strip() if data.get("description") else trek.description

    if data.get("start_date"):
        try:
            trek.start_date = datetime.strptime(data.get("start_date"), "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Invalid start date format. Use YYYY-MM-DD"}), 400
    if data.get("end_date"):
        try:
            trek.end_date = datetime.strptime(data.get("end_date"), "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Invalid end date format. Use YYYY-MM-DD"}), 400

    if trek.difficulty not in ["EASY", "MODERATE", "HARD"]:
        return jsonify({"message": "Difficulty must be EASY, MODERATE, or HARD"}), 400

    new_staff_id = data.get("assigned_staff_id")
    if new_staff_id is not None:
        old_staff_id = trek.assigned_staff_id
        trek.assigned_staff_id = int(new_staff_id) if new_staff_id else None

        if trek.assigned_staff_id != old_staff_id:
            if old_staff_id:
                old_assignment = StaffAssignment.query.filter_by(staff_id=old_staff_id, trek_id=trek.id).first()
                if old_assignment:
                    db.session.delete(old_assignment)
            if trek.assigned_staff_id:
                new_assignment = StaffAssignment(
                    staff_id=trek.assigned_staff_id,
                    trek_id=trek.id
                )
                db.session.add(new_assignment)

    db.session.commit()
    return jsonify({"message": "Trek updated successfully", "trek": trek.to_dict()}), 200

#admin delete trek by id 
@app.route("/api/admin/treks/<int:trek_id>", methods=["DELETE"])
@admin_required()
def delete_trek(trek_id):
    trek = Trek.query.filter_by(id=trek_id).first()
    if not trek:
        return jsonify({"message": "Trek not found"}), 404

    # Delete related assignments
    StaffAssignment.query.filter_by(trek_id=trek.id).delete()

    db.session.delete(trek)
    db.session.commit()
    return jsonify({"message": "Trek deleted successfully"}), 200

# admin get staff management    
@app.route("/api/admin/staff", methods=["GET"])
@admin_required()
def list_staff():
    staff = User.query.filter_by(role="STAFF").all()
    return jsonify([s.to_dict() for s in staff]), 200

# admin create new staff 
@app.route("/api/admin/staff", methods=["POST"])
@admin_required()
def create_staff():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    contact = data.get("contact")

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required"}), 400

    email = email.strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email is already registered"}), 400

    hashed_password = generate_password_hash(password)
    staff = User(
        name=name.strip(),
        email=email,
        password_hash=hashed_password,
        role="STAFF",
        contact=contact.strip() if contact else None,
        is_active=True,
    )
    db.session.add(staff)
    db.session.commit()
    return jsonify({"message": "Staff member created successfully", "staff": staff.to_dict()}), 201

# admin create assign staff to trek
@app.route("/api/admin/treks/<int:trek_id>/assign-staff", methods=["POST"])
@admin_required()
def assign_staff_to_trek(trek_id):
    trek = Trek.query.filter_by(id=trek_id).first()
    if not trek:
        return jsonify({"message": "Trek not found"}), 404

    data = request.get_json() or {}
    staff_id = data.get("staff_id")

    if not staff_id:
        return jsonify({"message": "Staff ID is required"}), 400

    staff = User.query.filter_by(id=staff_id, role="STAFF").first()
    if not staff:
        return jsonify({"message": "Staff member not found"}), 404

    old_staff_id = trek.assigned_staff_id
    trek.assigned_staff_id = staff.id

    if old_staff_id:
        old_assign = StaffAssignment.query.filter_by(staff_id=old_staff_id, trek_id=trek.id).first()
        if old_assign:
            db.session.delete(old_assign)

    existing_assign = StaffAssignment.query.filter_by(staff_id=staff.id, trek_id=trek.id).first()
    if not existing_assign:
        new_assign = StaffAssignment(staff_id=staff.id, trek_id=trek.id)
        db.session.add(new_assign)

    db.session.commit()
    return jsonify({"message": "Staff assigned to trek successfully", "trek": trek.to_dict()}), 200

# admin get all trekkers
@app.route("/api/admin/trekkers", methods=["GET"])
@admin_required()
def list_trekkers():
    trekkers = User.query.filter_by(role="USER").all()
    return jsonify([t.to_dict() for t in trekkers]), 200

# admin toggle user status (activate/deactivate)
@app.route("/api/admin/users/<int:user_id>/toggle-status", methods=["POST"])
@admin_required()
def toggle_user_status(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    current_user_id = get_jwt_identity()
    if user.id == current_user_id:
        return jsonify({"message": "Cannot toggle status of own account"}), 400

    user.is_active = not user.is_active
    db.session.commit()
    status = "activated" if user.is_active else "deactivated"
    return jsonify({"message": f"User account has been {status}", "user": user.to_dict()}), 200

# admin get all bookings
@app.route("/api/admin/bookings", methods=["GET"])
@admin_required()
def list_bookings():
    bookings = Booking.query.all()
    results = []
    for booking in bookings:
        b_dict = booking.to_dict()
        user = User.query.filter_by(id=booking.user_id).first()
        trek = Trek.query.filter_by(id=booking.trek_id).first()
        b_dict["user_name"] = user.name if user else "Unknown User"
        b_dict["user_email"] = user.email if user else "Unknown Email"
        b_dict["trek_name"] = trek.name if trek else "Unknown Trek"
        results.append(b_dict)
    return jsonify(results), 200


# ---- Trek Staff Management Routes ----
# Staff dashboard stats
@app.route("/api/staff/treks", methods=["GET"])
@staff_required()
def staff_list_treks():
    current_staff_id = get_jwt_identity()
    # Find all treks assigned to this staff member
    treks = Trek.query.filter_by(assigned_staff_id=current_staff_id).all()
    
    results = []
    for trek in treks:
        t_dict = trek.to_dict()
        # Count active bookings for this trek
        active_bookings_count = Booking.query.filter_by(trek_id=trek.id, status="BOOKED").count()
        t_dict["bookings_count"] = active_bookings_count
        results.append(t_dict)
        
    return jsonify(results), 200

# Staff get participants of a specific trek
@app.route("/api/staff/treks/<int:trek_id>/participants", methods=["GET"])
@staff_required()
def staff_get_trek_participants(trek_id):
    current_staff_id = get_jwt_identity()
    trek = Trek.query.filter_by(id=trek_id).first()
    if not trek:
        return jsonify({"message": "Trek not found"}), 404
        
    if trek.assigned_staff_id != current_staff_id:
        return jsonify({"message": "Access denied: You are not assigned to this trek"}), 403
        
    bookings = Booking.query.filter_by(trek_id=trek_id).all()
    results = []
    for booking in bookings:
        b_dict = booking.to_dict()
        user = User.query.filter_by(id=booking.user_id).first()
        b_dict["user_name"] = user.name if user else "Unknown User"
        b_dict["user_email"] = user.email if user else "Unknown Email"
        b_dict["user_contact"] = user.contact if user else ""
        results.append(b_dict)
        
    return jsonify(results), 200

# Staff update trek details slots and status
@app.route("/api/staff/treks/<int:trek_id>", methods=["PUT"])
@staff_required()
def staff_update_trek(trek_id):
    current_staff_id = get_jwt_identity()
    trek = Trek.query.filter_by(id=trek_id).first()
    if not trek:
        return jsonify({"message": "Trek not found"}), 404
        
    if trek.assigned_staff_id != current_staff_id:
        return jsonify({"message": "Access denied: You are not assigned to this trek"}), 403
        
    data = request.get_json() or {}
    
    if "available_slots" in data:
        try:
            slots = int(data["available_slots"])
            if slots < 0:
                return jsonify({"message": "Available slots cannot be negative"}), 400
            trek.available_slots = slots
        except ValueError:
            return jsonify({"message": "Available slots must be a valid integer"}), 400
            
    if "status" in data:
        status = data["status"]
        if status not in ["OPEN", "CLOSED", "COMPLETED", "APPROVED", "PENDING"]:
            return jsonify({"message": f"Invalid trek status: {status}"}), 400
        trek.status = status
        
    db.session.commit()
    return jsonify({"message": "Trek updated successfully", "trek": trek.to_dict()}), 200


# ---- Frontend static view route ----

@app.route("/")
def serve_index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
