from datetime import datetime, timedelta, date
import csv
import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlalchemy import func
from celery_app import celery, flask_app
from models import db, User, Trek, Booking

def _ensure_output_dir(folder_name: str) -> str:
    
    static_folder = flask_app.static_folder
    output_dir = os.path.join(static_folder, folder_name)
    os.makedirs(output_dir, exist_ok=True)
    return output_dir
# Sending emails
def _send_email_via_smtp(recipient: str, subject: str, html_body: str, text_body: str = None):
    sender = flask_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@trekkingmanagement.com')
    host = flask_app.config.get('MAIL_SERVER', 'localhost')
    port = int(flask_app.config.get('MAIL_PORT', 1025))

    message = MIMEMultipart('alternative')
    message['Subject'] = subject
    message['From'] = sender
    message['To'] = recipient
    
    if text_body:
        message.attach(MIMEText(text_body, 'plain'))
    message.attach(MIMEText(html_body, 'html'))

    with smtplib.SMTP(host, port, timeout=15) as smtp:
        smtp.sendmail(sender, [recipient], message.as_string())
# daily reminder job
@celery.task(name='tasks.daily_reminder_job')
def daily_reminder_job():
    tomorrow = date.today() + timedelta(days=1)
    # Find all treks starting tomorrow
    treks = Trek.query.filter_by(start_date=tomorrow).all()
    if not treks:
        return {"message": "No treks starting tomorrow. No reminders sent.", "count": 0}
        
    trek_ids = [t.id for t in treks]
    bookings = Booking.query.filter(Booking.trek_id.in_(trek_ids), Booking.status == "BOOKED").all()
    
    sent_count = 0
    for b in bookings:
        user = User.query.get(b.user_id)
        trek = Trek.query.get(b.trek_id)
        if not user or not trek:
            continue
            
        subject = f"Reminder: Your Trek '{trek.name}' Starts Tomorrow!"
        text_content = f"Hi {user.name},\n\nThis is a friendly reminder that your trek '{trek.name}' is scheduled to start tomorrow ({trek.start_date.isoformat()}) at {trek.location}.\n\nDuration: {trek.duration_days} days.\nDifficulty: {trek.difficulty}.\n\nPlease ensure you have packed all necessary gear and read the instructions.\n\nHappy Trekking!\nTrekking Management Team"
        
        html_content = f"""
        <html>
            <body>
                <p>Hi {user.name},</p>
                <p>This is a friendly reminder that your trek '{trek.name}' is scheduled to start tomorrow ({trek.start_date.isoformat()}) at {trek.location}.</p>
                <p><strong>Trek Details:</strong></p>
                <ul>
                    <li>Trek Name: {trek.name}</li>
                    <li>Start Location: {trek.location}</li>
                    <li>Duration: {trek.duration_days} days</li>
                    <li>Difficulty: {trek.difficulty}</li>
                </ul>
                <p>Please pack your gear and check coordinator instructions. Safe travels!</p>
                <p>Best regards,<br>Trekking Management Team</p>
            </body>
        </html>
        """
        
        try:
            _send_email_via_smtp(user.email, subject, html_content, text_content)
            sent_count += 1
        except Exception:
            pass
            
    return {
        "message": "Daily reminders task executed",
        "scheduled_count": len(bookings),
        "sent_count": sent_count
    }
# monthly report job
@celery.task(name='tasks.monthly_report_job')
def monthly_report_job():

    today_dt = datetime.now()
    start_date = (today_dt - timedelta(days=30)).date()
    end_date = today_dt.date()
    
    # Query total treks conducted in the last 30 days
    total_treks = Trek.query.filter(Trek.start_date >= start_date, Trek.start_date <= end_date).count()
    
    # Query total bookings registered in the last 30 days 
    total_participants = Booking.query.filter(
        Booking.booking_date >= today_dt - timedelta(days=30),
        Booking.status.in_(["BOOKED", "COMPLETED"])
    ).count()
    
    # Group by trek_id to find popular treks in the last 30 days (excluding cancelled)
    popular_treks_query = db.session.query(
        Booking.trek_id, func.count(Booking.id).label("booking_count")
    ).filter(
        Booking.booking_date >= today_dt - timedelta(days=30),
        Booking.status.in_(["BOOKED", "COMPLETED"])
    ).group_by(Booking.trek_id).order_by(func.count(Booking.id).desc()).limit(5).all()
    
    popular_treks = []
    for trek_id, count in popular_treks_query:
        trek = Trek.query.get(trek_id)
        if trek:
            popular_treks.append({
                "name": trek.name,
                "location": trek.location,
                "difficulty": trek.difficulty,
                "bookings": count
            })
              
    popular_treks_rows = []
    for pt in popular_treks:
        popular_treks_rows.append(f"<li>{pt['name']} ({pt['location']}) - {pt['bookings']} bookings</li>")

    # Generate HTML content
    html_content = f"""
    <html>
        <body>
            <h2>Monthly Trekking Performance Summary</h2>
            <p>Hi Admin,</p>
            <p>Here is the summary of trekking performance for the past 30 days ({start_date.strftime('%d %b %Y')} to {end_date.strftime('%d %b %Y')}):</p>
            <ul>
                <li>Total Treks Arranged: {total_treks}</li>
                <li>Total Registered Bookings: {total_participants}</li>
            </ul>
            
            <h3>Top Popular Treks (Past 30 Days)</h3>
            <ul>
                {"".join(popular_treks_rows) if popular_treks else "<li>No bookings made</li>"}
            </ul>
            
            <p>Report generated programmatically via Trekking Management Application.</p>
        </body>
    </html>
    """
    
    recipient = "admin@gmail.com"
    subject = f"Monthly Trekking Performance Summary - Last 30 Days"
    text_content = f"Hi Admin,\n\nMonthly trekking report for the past 30 days ({start_date.strftime('%d %b %Y')} to {end_date.strftime('%d %b %Y')}).\nTreks arranged: {total_treks}\nParticipants: {total_participants}\n\nCheck your HTML email client to view full details."
    
    _send_email_via_smtp(recipient, subject, html_content, text_content)
    return {
        "message": "Monthly report task executed",
        "total_treks": total_treks,
        "total_participants": total_participants
    }
# export booking history to CSV
@celery.task(name='tasks.export_booking_history_csv')
def export_booking_history_csv(user_id: int):
    user = User.query.get(user_id)
    if not user:
        return {"status": "FAILED", "message": "User not found"}
        
    bookings = Booking.query.filter_by(user_id=user_id).all()
    
    exports_dir = _ensure_output_dir("exports")
    filename = f"booking_history_{user_id}.csv"
    filepath = os.path.join(exports_dir, filename)
    
    try:
        with open(filepath, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Booking ID", "User ID", "Trek Name", "Location", "Booking Status", "Start Date", "End Date", "Booking Date"])
            
            for b in bookings:
                trek = Trek.query.get(b.trek_id)
                writer.writerow([
                    b.id,
                    b.user_id,
                    trek.name if trek else "Unknown Trek",
                    trek.location if trek else "Unknown",
                    b.status,
                    trek.start_date.isoformat() if trek else "",
                    trek.end_date.isoformat() if trek else "",
                    b.booking_date.isoformat() if b.booking_date else ""
                ])
        
        download_url = f"/static/exports/{filename}"
        return {
            "status": "SUCCESS", 
            "download_url": download_url,
            "message": "Export completed successfully"
        }
    except Exception as e:
        return {"status": "FAILED", "message": str(e)}
