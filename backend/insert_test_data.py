#!/usr/bin/env python3
"""
Script untuk insert test data: Events, Tasks, dan Attendance
"""
from models import SessionLocal, Event, Task, Attendance, User
from datetime import datetime, timedelta
import random

def insert_test_events():
    """Insert sample events"""
    db = SessionLocal()
    try:
        # Hapus event lama
        db.query(Event).delete()
        db.commit()
        
        today = datetime.now()
        
        events_data = [
            {
                "title": "Team Meeting - Sprint Planning",
                "description": "Planning sprint untuk 2 minggu ke depan",
                "event_type": "meeting",
                "date": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
                "time": "14:00",
                "location": "Meeting Room A",
                "status": "scheduled",
            },
            {
                "title": "Deadline Project Alpha",
                "description": "Submission final project untuk client",
                "event_type": "deadline",
                "date": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
                "time": "17:00",
                "location": "Online",
                "status": "scheduled",
            },
            {
                "title": "AI & Machine Learning Workshop",
                "description": "Training tentang implementasi AI di workplace",
                "event_type": "training",
                "date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
                "time": "09:00",
                "location": "Training Center",
                "status": "scheduled",
            },
            {
                "title": "Code Review Session",
                "description": "Review code bersama untuk improve quality",
                "event_type": "meeting",
                "date": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
                "time": "15:30",
                "location": "Dev Room",
                "status": "scheduled",
            },
            {
                "title": "Product Launch Preparation",
                "description": "Final check sebelum product launch",
                "event_type": "meeting",
                "date": (today + timedelta(days=10)).strftime("%Y-%m-%d"),
                "time": "10:00",
                "location": "Conference Room",
                "status": "scheduled",
            },
        ]
        
        for event_data in events_data:
            event = Event(**event_data)
            db.add(event)
        
        db.commit()
        print(f"✅ Berhasil insert {len(events_data)} events")
        
    except Exception as e:
        print(f"❌ Error insert events: {e}")
        db.rollback()
    finally:
        db.close()

def insert_test_tasks():
    """Insert sample tasks for testing"""
    db = SessionLocal()
    try:
        # Get first user
        user = db.query(User).first()
        if not user:
            print("❌ Tidak ada user di database. Registrasi dulu!")
            return
        
        today = datetime.now()
        
        tasks_data = [
            {
                "title": "Implement Face Recognition API",
                "description": "Develop face recognition endpoint dengan Python",
                "user_id": user.id,
                "priority": "high",
                "status": "in_progress",
                "category": "development",
                "deadline": today + timedelta(days=2),
            },
            {
                "title": "Update Dashboard UI",
                "description": "Modernize dashboard dengan glassmorphism design",
                "user_id": user.id,
                "priority": "medium",
                "status": "completed",
                "category": "design",
                "deadline": today - timedelta(days=1),
                "completed_at": datetime.now(),
            },
            {
                "title": "Write API Documentation",
                "description": "Document semua endpoint untuk developer guide",
                "user_id": user.id,
                "priority": "medium",
                "status": "pending",
                "category": "documentation",
                "deadline": today + timedelta(days=5),
            },
            {
                "title": "Code Review - Authentication Module",
                "description": "Review security implementation di auth module",
                "user_id": user.id,
                "priority": "high",
                "status": "in_progress",
                "category": "review",
                "deadline": today + timedelta(days=1),
            },
            {
                "title": "Database Backup Setup",
                "description": "Setup automated backup untuk production database",
                "user_id": user.id,
                "priority": "urgent",
                "status": "pending",
                "category": "infrastructure",
                "deadline": today + timedelta(days=3),
            },
        ]
        
        for task_data in tasks_data:
            task = Task(**task_data)
            db.add(task)
        
        db.commit()
        print(f"✅ Berhasil insert {len(tasks_data)} tasks untuk user: {user.name}")
        
    except Exception as e:
        print(f"❌ Error insert tasks: {e}")
        db.rollback()
    finally:
        db.close()

def insert_sample_attendance():
    """Insert sample attendance for last 7 days"""
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            print("❌ Tidak ada user di database!")
            return
        
        today = datetime.now()
        
        # Insert attendance untuk 7 hari terakhir
        for i in range(7, 0, -1):
            date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            
            # Check if attendance already exists
            existing = db.query(Attendance).filter(
                Attendance.user_id == user.id,
                Attendance.date == date
            ).first()
            
            if existing:
                continue
            
            # Random check-in time (08:00 - 09:00)
            check_in_hour = random.choice([8, 8, 8, 9])  # More likely to be on time
            check_in_minute = random.randint(0, 59)
            check_in = datetime.strptime(date, "%Y-%m-%d").replace(
                hour=check_in_hour, minute=check_in_minute
            )
            
            # Random check-out time (17:00 - 18:00)
            check_out_hour = random.choice([17, 18])
            check_out_minute = random.randint(0, 59)
            check_out = datetime.strptime(date, "%Y-%m-%d").replace(
                hour=check_out_hour, minute=check_out_minute
            )
            
            # Calculate work hours
            work_hours = (check_out - check_in).total_seconds() / 3600
            
            # Determine status
            status = "late" if check_in_hour >= 9 else "on_time"
            
            attendance = Attendance(
                user_id=user.id,
                date=date,
                check_in_time=check_in,
                check_out_time=check_out,
                status=status,
                work_hours=work_hours,
                location="Office"
            )
            db.add(attendance)
        
        db.commit()
        print(f"✅ Berhasil insert sample attendance untuk user: {user.name}")
        
    except Exception as e:
        print(f"❌ Error insert attendance: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔧 Inserting test data...\n")
    
    # Insert Events
    print("📅 Inserting Events...")
    insert_test_events()
    
    # Insert Tasks
    print("\n📝 Inserting Tasks...")
    insert_test_tasks()
    
    # Insert Sample Attendance
    print("\n📊 Inserting Sample Attendance...")
    insert_sample_attendance()
    
    print("\n✅ Semua test data berhasil diinsert!\n")
