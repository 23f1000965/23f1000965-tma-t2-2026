from datetime import datetime

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("ADMIN", "STAFF", "USER", name="user_role"), nullable=False, index=True)
    contact = db.Column(db.String(30))
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assigned_treks = db.relationship("Trek", backref="assigned_staff", lazy=True)
    bookings = db.relationship("Booking", backref="user", lazy=True, cascade="all, delete-orphan")
    export_jobs = db.relationship("ExportJob", backref="user", lazy=True, cascade="all, delete-orphan")



    def __repr__(self):
        return f"<User {self.email}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "contact": self.contact,
            "is_active": self.is_active,
        }



class Trek(db.Model):
    __tablename__ = "treks"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False, index=True)
    difficulty = db.Column(db.Enum("EASY", "MODERATE", "HARD", name="trek_difficulty"), nullable=False, index=True)
    duration_days = db.Column(db.Integer, nullable=False)
    available_slots = db.Column(db.Integer, nullable=False)
    assigned_staff_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    status = db.Column(
        db.Enum("PENDING", "APPROVED", "OPEN", "CLOSED", "COMPLETED", name="trek_status"),
        default="PENDING",
        nullable=False,
        index=True,
    )
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    bookings = db.relationship("Booking", backref="trek", lazy=True, cascade="all, delete-orphan")
    staff_assignments = db.relationship("StaffAssignment", backref="trek", lazy=True, cascade="all, delete-orphan")


    def __repr__(self):
        return f"<Trek {self.name}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "difficulty": self.difficulty,
            "duration_days": self.duration_days,
            "available_slots": self.available_slots,
            "assigned_staff_id": self.assigned_staff_id,
            "status": self.status,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "description": self.description,
        }


class StaffAssignment(db.Model):
    __tablename__ = "staff_assignments"

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    trek_id = db.Column(db.Integer, db.ForeignKey("treks.id"), nullable=False, index=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    staff = db.relationship("User", backref="staff_assignments")

    __table_args__ = (
        db.UniqueConstraint("staff_id", "trek_id", name="unique_staff_trek_assignment"),
    )

    
    def __repr__(self):
        return f"<StaffAssignment staff={self.staff_id} trek={self.trek_id}>"


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    trek_id = db.Column(db.Integer, db.ForeignKey("treks.id"), nullable=False, index=True)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.Enum("BOOKED", "CANCELLED", "COMPLETED", name="booking_status"), default="BOOKED", nullable=False, index=True)
    payment_status = db.Column(db.Enum("NOT_REQUIRED", "PENDING", "PAID", "FAILED", name="payment_status"), default="NOT_REQUIRED", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "trek_id", name="unique_user_trek_booking"),
    )



    def __repr__(self):
        return f"<Booking {self.id} - {self.status}>"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "trek_id": self.trek_id,
            "booking_date": self.booking_date.isoformat(),
            "status": self.status,
            "payment_status": self.payment_status,
        }


class ExportJob(db.Model):
    __tablename__ = "export_jobs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    status = db.Column(db.Enum("PENDING", "RUNNING", "COMPLETED", "FAILED", name="export_job_status"), default="PENDING", nullable=False)
    file_path = db.Column(db.String(255))
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime)

    def __repr__(self):
        return f"<ExportJob {self.id} - {self.status}>"


class NotificationLog(db.Model):
    __tablename__ = "notification_logs"

    id = db.Column(db.Integer, primary_key=True)
    recipient_user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    channel = db.Column(db.Enum("EMAIL", "SMS", "WEBHOOK", name="notification_channel"), nullable=False)
    subject = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum("PENDING", "SENT", "FAILED", name="notification_status"), default="PENDING", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    recipient = db.relationship("User", backref="notification_logs")

    def __repr__(self):
        return f"<NotificationLog {self.id} - {self.status}>"
