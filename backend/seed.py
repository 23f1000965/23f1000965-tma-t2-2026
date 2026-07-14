from datetime import datetime
from pathlib import Path
from app import app
from models import db, User
from werkzeug.security import generate_password_hash

def seed_db():
    # Ensure instance directory exists
    Path(app.instance_path).mkdir(parents=True, exist_ok=True)
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        
        print("Creating all tables...")
        db.create_all()
        
        print("Seeding default Admin user...")
        admin = User(
            name=app.config["ADMIN_NAME"],
            email=app.config["ADMIN_EMAIL"],
            password_hash=generate_password_hash(app.config["ADMIN_PASSWORD"]),
            role="ADMIN",
            contact="1234567890",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.session.add(admin)
        db.session.commit()
        print(" Admin user created.")

if __name__ == "__main__":
    seed_db()
