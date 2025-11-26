from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from models import get_db, User, Attendance, Task
from pydantic import BaseModel
from typing import List, Optional, Dict
import datetime
import pytz
import logging
from logging.handlers import RotatingFileHandler
import os

# Setup logging
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)
    print(f"Created logs directory at: {os.path.abspath(log_dir)}")

# Create formatters
detailed_formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s - %(message)s'
)

# File handler for all logs
log_file_path = os.path.join(log_dir, 'backend.log')
print(f"Setting up log file at: {os.path.abspath(log_file_path)}")

file_handler = RotatingFileHandler(
    log_file_path,
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5,
    encoding='utf-8'  # Use UTF-8 encoding for emoji support
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(detailed_formatter)

# File handler for errors only
error_log_path = os.path.join(log_dir, 'error.log')
error_handler = RotatingFileHandler(
    error_log_path,
    maxBytes=10*1024*1024,
    backupCount=5,
    encoding='utf-8'  # Use UTF-8 encoding for emoji support
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(detailed_formatter)

# Configure logger
logger = logging.getLogger("workflow_id")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(error_handler)
logger.propagate = False  # Prevent double logging

app = FastAPI(title="WorkFlow ID Backend", version="1.0.0")

logger.info("=== WorkFlow ID Backend starting ===")
print("Logger initialized successfully")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:5173",      # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function: Detect gender from name (simple pattern matching)
def detect_gender_from_name(name: str) -> str:
    """Simple gender detection from Indonesian names"""
    name_lower = name.lower()
    
    # Common female name patterns
    female_patterns = ['siti', 'putri', 'dewi', 'ayu', 'sri', 'indah', 'rina', 'wati', 'ani', 'fitri']
    # Common male name patterns
    male_patterns = ['ahmad', 'muhammad', 'budi', 'agus', 'adi', 'doni', 'joko', 'hendra', 'rudi', 'yanto']
    
    for pattern in female_patterns:
        if pattern in name_lower:
            return 'female'
    
    for pattern in male_patterns:
        if pattern in name_lower:
            return 'male'
    
    return 'other'  # Default if can't determine

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    face_embedding: Optional[str] = None
    gender: Optional[str] = None  # male, female, other

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    face_embedding: Optional[str] = None
    gender: str = 'other'

class TaskCreate(BaseModel):
    title: str
    description: str
    user_id: int

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    user_id: int

class UserUpdate(BaseModel):
    face_embedding: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None

class AttendanceCreate(BaseModel):
    user_id: int

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime.datetime

class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    average_work_hours: float
    productivity_rate: float

class AttendanceByDay(BaseModel):
    day: str
    hadir: int
    izin: int
    alpha: int

class TaskDistribution(BaseModel):
    completed: int
    in_progress: int
    pending: int
    overdue: int

class RecentActivity(BaseModel):
    id: int
    user_name: str
    action: str
    time: str
    type: str
    avatar: str

# New Attendance Models untuk sistem modern
class AttendanceCheckIn(BaseModel):
    user_id: int
    face_embedding: str
    location: Optional[str] = None

class AttendanceCheckOut(BaseModel):
    user_id: int

class AttendanceDetailResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    date: str
    check_in_time: datetime.datetime
    check_out_time: Optional[datetime.datetime]
    status: str
    work_hours: Optional[float]
    notes: Optional[str]
    location: Optional[str]

class AttendanceStatsResponse(BaseModel):
    total_days: int
    present_days: int
    late_days: int
    absent_days: int
    average_work_hours: float
    attendance_rate: float

@app.get("/")
async def root():
    logger.info("[ROOT] Root endpoint accessed")
    return {"message": "WorkFlow ID API"}

@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    print(f"[CREATE_USER] Creating new user - Name: {user.name}, Email: {user.email}")
    logger.info(f"[CREATE_USER] Creating new user - Name: {user.name}, Email: {user.email}")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        print(f"[CREATE_USER] Email already exists: {user.email}")
        logger.warning(f"[CREATE_USER] Email already exists: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Auto-detect gender if not provided
    gender = user.gender if user.gender else detect_gender_from_name(user.name)
    
    db_user = User(
        name=user.name, 
        email=user.email, 
        face_embedding=user.face_embedding,
        gender=gender
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    print(f"[CREATE_USER] User created successfully - ID: {db_user.id}, Name: {db_user.name}, Gender: {db_user.gender}")
    logger.info(f"[CREATE_USER] User created successfully - ID: {db_user.id}, Name: {db_user.name}, Gender: {db_user.gender}")
    return db_user

@app.get("/users", response_model=List[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    print(f"[GET_USERS] Fetching all users")
    logger.info(f"[GET_USERS] Fetching all users")
    users = db.query(User).all()
    print(f"[GET_USERS] Found {len(users)} users")
    logger.info(f"[GET_USERS] Found {len(users)} users")
    return users

@app.post("/attendance", response_model=AttendanceResponse)
async def create_attendance(att: AttendanceCreate, db: Session = Depends(get_db)):
    db_att = Attendance(user_id=att.user_id)
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

@app.get("/attendance", response_model=List[AttendanceResponse])
async def get_attendances(db: Session = Depends(get_db)):
    return db.query(Attendance).all()

@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(title=task.title, description=task.description, user_id=task.user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

# ==================== MODERN ATTENDANCE SYSTEM ====================

# Helper function: Get current WIB time
def get_wib_time():
    """Get current time in WIB (UTC+7) timezone"""
    wib = pytz.timezone('Asia/Jakarta')
    return datetime.datetime.now(wib)

# Helper function: Check if late (after 8:00 AM)
def is_late(check_in_time: datetime.datetime) -> bool:
    """Check if check-in time is after 8:00 AM WIB"""
    cutoff_hour = 8
    cutoff_minute = 0
    return check_in_time.hour > cutoff_hour or (check_in_time.hour == cutoff_hour and check_in_time.minute > cutoff_minute)

# Helper function: Calculate similarity between embeddings
def calculate_embedding_similarity(embedding1: str, embedding2: str) -> float:
    """Calculate cosine similarity between two face embeddings"""
    try:
        import json
        import numpy as np
        
        emb1 = np.array(json.loads(embedding1))
        emb2 = np.array(json.loads(embedding2))
        
        # Cosine similarity
        dot_product = np.dot(emb1, emb2)
        norm1 = np.linalg.norm(emb1)
        norm2 = np.linalg.norm(emb2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        return float(similarity)
    except Exception as e:
        logger.error(f"[ATTENDANCE] Error calculating similarity: {str(e)}")
        return 0.0

@app.post("/attendance/check-in")
async def check_in(check_in_data: AttendanceCheckIn, db: Session = Depends(get_db)):
    """
    Check-in karyawan dengan face recognition
    - Validasi face embedding match dengan database
    - 1x check-in per hari
    - Deteksi keterlambatan (jam 8 WIB)
    """
    logger.info(f"[CHECK-IN] User {check_in_data.user_id} attempting check-in")
    
    try:
        # 1. Verify user exists
        user = db.query(User).filter(User.id == check_in_data.user_id).first()
        if not user:
            logger.warning(f"[CHECK-IN] User not found: {check_in_data.user_id}")
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # 2. Verify face embedding match
        if not user.face_embedding:
            logger.warning(f"[CHECK-IN] User {user.name} has no face embedding registered")
            raise HTTPException(status_code=400, detail="Wajah belum terdaftar. Silakan registrasi terlebih dahulu.")
        
        similarity = calculate_embedding_similarity(user.face_embedding, check_in_data.face_embedding)
        THRESHOLD = 0.55  # Same as login threshold
        
        if similarity < THRESHOLD:
            logger.warning(f"[CHECK-IN] Face mismatch for user {user.name} - Similarity: {similarity:.2f}")
            raise HTTPException(
                status_code=401, 
                detail=f"Wajah tidak cocok! (Similarity: {similarity:.2%}). Pastikan pencahayaan baik dan wajah terlihat jelas."
            )
        
        logger.info(f"[CHECK-IN] Face verified for user {user.name} - Similarity: {similarity:.2%}")
        
        # 3. Get current WIB time
        current_time = get_wib_time()
        today_date = current_time.strftime("%Y-%m-%d")
        
        # 4. Check if already checked in today
        existing_attendance = db.query(Attendance).filter(
            and_(
                Attendance.user_id == check_in_data.user_id,
                Attendance.date == today_date
            )
        ).first()
        
        if existing_attendance:
            logger.warning(f"[CHECK-IN] User {user.name} already checked in today at {existing_attendance.check_in_time}")
            raise HTTPException(
                status_code=400, 
                detail=f"Anda sudah absen hari ini pada pukul {existing_attendance.check_in_time.strftime('%H:%M WIB')}!"
            )
        
        # 5. Determine status (on_time or late)
        status = "late" if is_late(current_time) else "on_time"
        status_text = "TERLAMBAT 🕒" if status == "late" else "TEPAT WAKTU ✅"
        
        # 6. Create attendance record
        new_attendance = Attendance(
            user_id=check_in_data.user_id,
            date=today_date,
            check_in_time=current_time,
            status=status,
            location=check_in_data.location,
            timestamp=current_time  # Legacy field
        )
        
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        
        logger.info(f"[CHECK-IN] SUCCESS - User: {user.name}, Gender: {user.gender}, Time: {current_time.strftime('%H:%M WIB')}, Status: {status}")
        
        return {
            "message": f"Check-in berhasil! Status: {status_text}",
            "user_name": user.name,
            "user_gender": user.gender,
            "check_in_time": current_time.strftime("%H:%M WIB"),
            "date": today_date,
            "status": status,
            "similarity": round(similarity * 100, 1),
            "attendance_id": new_attendance.id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CHECK-IN] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.post("/attendance/check-out")
async def check_out(check_out_data: AttendanceCheckOut, db: Session = Depends(get_db)):
    """
    Check-out karyawan
    - Validasi sudah check-in hari ini
    - Hitung total jam kerja
    """
    logger.info(f"[CHECK-OUT] User {check_out_data.user_id} attempting check-out")
    
    try:
        # 1. Verify user exists
        user = db.query(User).filter(User.id == check_out_data.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # 2. Get today's attendance
        current_time = get_wib_time()
        today_date = current_time.strftime("%Y-%m-%d")
        
        attendance = db.query(Attendance).filter(
            and_(
                Attendance.user_id == check_out_data.user_id,
                Attendance.date == today_date
            )
        ).first()
        
        if not attendance:
            logger.warning(f"[CHECK-OUT] User {user.name} hasn't checked in today")
            raise HTTPException(status_code=400, detail="Anda belum check-in hari ini!")
        
        if attendance.check_out_time:
            logger.warning(f"[CHECK-OUT] User {user.name} already checked out at {attendance.check_out_time}")
            raise HTTPException(
                status_code=400,
                detail=f"Anda sudah check-out hari ini pada pukul {attendance.check_out_time.strftime('%H:%M WIB')}!"
            )
        
        # 3. Calculate work hours
        check_in = attendance.check_in_time
        check_out = current_time
        work_duration = check_out - check_in
        work_hours = round(work_duration.total_seconds() / 3600, 2)  # Convert to hours
        
        # 4. Update attendance record
        attendance.check_out_time = check_out
        attendance.work_hours = work_hours
        
        db.commit()
        db.refresh(attendance)
        
        logger.info(f"[CHECK-OUT] SUCCESS - User: {user.name}, Time: {check_out.strftime('%H:%M WIB')}, Work Hours: {work_hours}h")
        
        return {
            "message": "Check-out berhasil! Terima kasih atas kerja keras Anda hari ini 👏",
            "user_name": user.name,
            "check_in_time": check_in.strftime("%H:%M WIB"),
            "check_out_time": check_out.strftime("%H:%M WIB"),
            "work_hours": work_hours,
            "date": today_date
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[CHECK-OUT] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/attendance/history/{user_id}")
async def get_attendance_history(
    user_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get attendance history untuk user dengan filter
    Query params:
    - start_date: YYYY-MM-DD (default: 30 hari lalu)
    - end_date: YYYY-MM-DD (default: hari ini)
    - status: on_time, late, absent, leave
    """
    logger.info(f"[HISTORY] Fetching attendance history for user {user_id}")
    
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # Build query
        query = db.query(Attendance).filter(Attendance.user_id == user_id)
        
        # Date filters
        if start_date:
            query = query.filter(Attendance.date >= start_date)
        else:
            # Default: last 30 days
            thirty_days_ago = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
            query = query.filter(Attendance.date >= thirty_days_ago)
        
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        
        # Status filter
        if status:
            query = query.filter(Attendance.status == status)
        
        # Execute query
        attendances = query.order_by(Attendance.date.desc()).all()
        
        # Format response
        history = []
        for att in attendances:
            history.append({
                "id": att.id,
                "user_id": att.user_id,
                "user_name": user.name,
                "date": att.date,
                "check_in_time": att.check_in_time.strftime("%H:%M WIB") if att.check_in_time else None,
                "check_out_time": att.check_out_time.strftime("%H:%M WIB") if att.check_out_time else None,
                "status": att.status,
                "work_hours": att.work_hours,
                "notes": att.notes,
                "location": att.location
            })
        
        logger.info(f"[HISTORY] Found {len(history)} records for user {user.name}")
        
        return {
            "user_name": user.name,
            "total_records": len(history),
            "history": history
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[HISTORY] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/attendance/stats/{user_id}")
async def get_attendance_stats(user_id: int, db: Session = Depends(get_db)):
    """
    Get attendance statistics untuk user (bulan ini)
    """
    logger.info(f"[STATS] Fetching attendance stats for user {user_id}")
    
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # Get current month range
        current_time = get_wib_time()
        first_day = current_time.replace(day=1).strftime("%Y-%m-%d")
        last_day = (current_time.replace(day=28) + datetime.timedelta(days=4)).replace(day=1) - datetime.timedelta(days=1)
        last_day_str = last_day.strftime("%Y-%m-%d")
        
        # Query attendances for current month
        attendances = db.query(Attendance).filter(
            and_(
                Attendance.user_id == user_id,
                Attendance.date >= first_day,
                Attendance.date <= last_day_str
            )
        ).all()
        
        # Calculate stats
        total_days = len(attendances)
        on_time_days = len([att for att in attendances if att.status == "on_time"])
        late_days = len([att for att in attendances if att.status == "late"])
        absent_days = 0  # TODO: Calculate based on working days
        
        # Calculate average work hours
        work_hours_list = [att.work_hours for att in attendances if att.work_hours]
        avg_work_hours = round(sum(work_hours_list) / len(work_hours_list), 2) if work_hours_list else 0.0
        
        # Calculate attendance rate (assuming 22 working days per month)
        working_days_per_month = 22
        attendance_rate = round((total_days / working_days_per_month) * 100, 1) if total_days > 0 else 0.0
        
        logger.info(f"[STATS] User {user.name} - Total: {total_days}, On-time: {on_time_days}, Late: {late_days}")
        
        return {
            "user_name": user.name,
            "month": current_time.strftime("%B %Y"),
            "total_days": total_days,
            "present_days": on_time_days + late_days,
            "on_time_days": on_time_days,
            "late_days": late_days,
            "absent_days": absent_days,
            "average_work_hours": avg_work_hours,
            "attendance_rate": attendance_rate
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[STATS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/attendance/today")
async def get_today_attendance(db: Session = Depends(get_db)):
    """
    Get all attendance records for today (untuk admin/dashboard)
    """
    logger.info("[TODAY] Fetching today's attendance")
    
    try:
        current_time = get_wib_time()
        today_date = current_time.strftime("%Y-%m-%d")
        
        attendances = db.query(Attendance, User).join(User).filter(
            Attendance.date == today_date
        ).all()
        
        result = []
        for att, user in attendances:
            result.append({
                "id": att.id,
                "user_id": att.user_id,
                "user_name": user.name,
                "check_in_time": att.check_in_time.strftime("%H:%M WIB") if att.check_in_time else None,
                "check_out_time": att.check_out_time.strftime("%H:%M WIB") if att.check_out_time else None,
                "status": att.status,
                "work_hours": att.work_hours,
                "location": att.location
            })
        
        logger.info(f"[TODAY] Found {len(result)} attendance records for today")
        
        return {
            "date": today_date,
            "total_present": len(result),
            "attendances": result
        }
    
    except Exception as e:
        logger.error(f"[TODAY] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

# ==================== END MODERN ATTENDANCE SYSTEM ====================

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    print(f"[UPDATE_USER] Updating user - ID: {user_id}")
    logger.info(f"[UPDATE_USER] Updating user - ID: {user_id}")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        print(f"[UPDATE_USER] User not found - ID: {user_id}")
        logger.error(f"[UPDATE_USER] User not found - ID: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.name is not None:
        print(f"[UPDATE_USER] Updating name - User ID: {user_id}, Old: {user.name}, New: {user_update.name}")
        logger.info(f"[UPDATE_USER] Updating name - User ID: {user_id}, Old: {user.name}, New: {user_update.name}")
        user.name = user_update.name
    
    if user_update.email is not None:
        print(f"[UPDATE_USER] Updating email - User ID: {user_id}")
        logger.info(f"[UPDATE_USER] Updating email - User ID: {user_id}")
        user.email = user_update.email
    
    if user_update.gender is not None:
        print(f"[UPDATE_USER] Updating gender - User ID: {user_id}, Old: {user.gender}, New: {user_update.gender}")
        logger.info(f"[UPDATE_USER] Updating gender - User ID: {user_id}, Old: {user.gender}, New: {user_update.gender}")
        user.gender = user_update.gender
    
    if user_update.face_embedding is not None:
        embedding_length = len(user_update.face_embedding) if user_update.face_embedding else 0
        print(f"[UPDATE_USER] Updating face embedding - User ID: {user_id}, Embedding length: {embedding_length}")
        logger.info(f"[UPDATE_USER] Updating face embedding - User ID: {user_id}, Embedding length: {embedding_length}")
        user.face_embedding = user_update.face_embedding
    
    db.commit()
    db.refresh(user)
    
    print(f"[UPDATE_USER] User updated successfully - ID: {user_id}, Name: {user.name}, Gender: {user.gender}")
    logger.info(f"[UPDATE_USER] User updated successfully - ID: {user_id}, Name: {user.name}, Gender: {user.gender}")
    return user

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, completed: bool, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = completed
    db.commit()
    return task

# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    logger.info("[DASHBOARD] Fetching dashboard stats")
    
    # Total employees
    total_employees = db.query(User).count()
    
    # Present today (attendances created today)
    today = datetime.date.today()
    present_today = db.query(Attendance).filter(
        func.date(Attendance.timestamp) == today
    ).distinct(Attendance.user_id).count()
    
    # Average work hours (assume 8 hours for now, can be calculated from check-in/out)
    average_work_hours = 8.2
    
    # Productivity rate (completed tasks / total tasks)
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.completed == True).count()
    productivity_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    logger.info(f"[DASHBOARD] Stats - Employees: {total_employees}, Present: {present_today}, Productivity: {productivity_rate:.1f}%")
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "average_work_hours": average_work_hours,
        "productivity_rate": round(productivity_rate, 1)
    }

@app.get("/dashboard/attendance-weekly", response_model=List[AttendanceByDay])
async def get_weekly_attendance(db: Session = Depends(get_db)):
    """Get attendance data for the past 7 days"""
    logger.info("[DASHBOARD] Fetching weekly attendance")
    
    days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    result = []
    
    for i in range(7):
        date = datetime.date.today() - datetime.timedelta(days=6-i)
        
        # Count attendances for this day
        hadir = db.query(Attendance).filter(
            func.date(Attendance.timestamp) == date
        ).distinct(Attendance.user_id).count()
        
        # For now, mock izin and alpha (you can add separate tables later)
        izin = max(0, 3 - i % 3)
        alpha = max(0, 2 - i % 2) if i > 4 else 0
        
        result.append({
            "day": days[i],
            "hadir": hadir if hadir > 0 else 45 - (i * 2),  # Fallback to mock data
            "izin": izin,
            "alpha": alpha
        })
    
    return result

@app.get("/dashboard/task-distribution", response_model=TaskDistribution)
async def get_task_distribution(db: Session = Depends(get_db)):
    """Get task distribution by status"""
    logger.info("[DASHBOARD] Fetching task distribution")
    
    # Completed tasks
    completed = db.query(Task).filter(Task.completed == True).count()
    
    # In progress (created within last 3 days, not completed)
    three_days_ago = datetime.datetime.now() - datetime.timedelta(days=3)
    in_progress = db.query(Task).filter(
        and_(
            Task.completed == False,
            Task.created_at >= three_days_ago
        )
    ).count()
    
    # Pending (older than 3 days, not completed, not overdue)
    seven_days_ago = datetime.datetime.now() - datetime.timedelta(days=7)
    pending = db.query(Task).filter(
        and_(
            Task.completed == False,
            Task.created_at < three_days_ago,
            Task.created_at >= seven_days_ago
        )
    ).count()
    
    # Overdue (older than 7 days, not completed)
    overdue = db.query(Task).filter(
        and_(
            Task.completed == False,
            Task.created_at < seven_days_ago
        )
    ).count()
    
    logger.info(f"[DASHBOARD] Tasks - Completed: {completed}, Progress: {in_progress}, Pending: {pending}, Overdue: {overdue}")
    
    return {
        "completed": completed if completed > 0 else 45,
        "in_progress": in_progress if in_progress > 0 else 28,
        "pending": pending if pending > 0 else 15,
        "overdue": overdue if overdue > 0 else 12
    }

@app.get("/dashboard/recent-activities", response_model=List[RecentActivity])
async def get_recent_activities(db: Session = Depends(get_db)):
    """Get recent activities (last 10 attendances and tasks)"""
    logger.info("[DASHBOARD] Fetching recent activities")
    
    activities = []
    
    # Recent attendances (check-ins)
    recent_attendances = db.query(Attendance).join(User).order_by(
        Attendance.timestamp.desc()
    ).limit(5).all()
    
    for att in recent_attendances:
        time_str = att.timestamp.strftime("%H:%M WIB")
        activities.append({
            "id": att.id,
            "user_name": att.user.name,
            "action": "Check-in berhasil",
            "time": time_str,
            "type": "checkin",
            "avatar": ''.join([word[0].upper() for word in att.user.name.split()[:2]])
        })
    
    # Recent completed tasks
    recent_tasks = db.query(Task).join(User).filter(
        Task.completed == True
    ).order_by(Task.created_at.desc()).limit(5).all()
    
    for task in recent_tasks:
        time_str = task.created_at.strftime("%H:%M WIB")
        activities.append({
            "id": task.id + 1000,  # Offset to avoid ID collision
            "user_name": task.user.name,
            "action": f"Menyelesaikan tugas \"{task.title}\"",
            "time": time_str,
            "type": "task",
            "avatar": ''.join([word[0].upper() for word in task.user.name.split()[:2]])
        })
    
    # Sort by most recent
    activities = sorted(activities, key=lambda x: x['id'], reverse=True)[:10]
    
    # If no real data, return mock data
    if not activities:
        activities = [
            {
                "id": 1,
                "user_name": "Test Admin",
                "action": "Check-in berhasil",
                "time": datetime.datetime.now().strftime("%H:%M WIB"),
                "type": "checkin",
                "avatar": "TA"
            }
        ]
    
    return activities

@app.get("/dashboard/productivity-trend")
async def get_productivity_trend(db: Session = Depends(get_db)):
    """Get productivity trend for the last 4 weeks"""
    logger.info("[DASHBOARD] Fetching productivity trend")
    
    result = []
    
    for week in range(4, 0, -1):
        start_date = datetime.datetime.now() - datetime.timedelta(weeks=week)
        end_date = start_date + datetime.timedelta(weeks=1)
        
        # Count completed tasks in this week
        completed = db.query(Task).filter(
            and_(
                Task.completed == True,
                Task.created_at >= start_date,
                Task.created_at < end_date
            )
        ).count()
        
        # Calculate productivity score (scale to 100)
        score = min(100, 70 + (completed * 5))  # Base 70, +5 per completed task
        
        result.append({
            "name": f"Week {5 - week}",
            "value": score if score > 70 else 85 + (week * 2)  # Fallback to mock
        })
    
    return result

# ==================== TASK MANAGEMENT ENDPOINTS ====================

class TaskCreateV2(BaseModel):
    title: str
    description: str
    user_id: int
    priority: str = "medium"  # low, medium, high, urgent
    category: str = "general"
    deadline: Optional[str] = None  # ISO format string

class TaskUpdateV2(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    deadline: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponseV2(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    user_id: int
    user_name: str
    priority: str
    status: str
    category: str
    deadline: Optional[datetime.datetime]
    completed_at: Optional[datetime.datetime]
    created_at: datetime.datetime
    updated_at: datetime.datetime

@app.get("/tasks/user/{user_id}")
async def get_user_tasks(
    user_id: int,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all tasks for a specific user with filters"""
    logger.info(f"[TASKS] Fetching tasks for user {user_id}")
    
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # Build query
        query = db.query(Task).filter(Task.user_id == user_id)
        
        # Apply filters
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if category:
            query = query.filter(Task.category == category)
        
        # Execute query
        tasks = query.order_by(Task.created_at.desc()).all()
        
        # Format response
        result = []
        for task in tasks:
            result.append({
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "user_id": task.user_id,
                "user_name": user.name,
                "priority": task.priority,
                "status": task.status,
                "category": task.category,
                "deadline": task.deadline.isoformat() if task.deadline else None,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            })
        
        logger.info(f"[TASKS] Found {len(result)} tasks for user {user.name}")
        
        return {
            "user_name": user.name,
            "total_tasks": len(result),
            "tasks": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[TASKS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.post("/tasks/v2")
async def create_task_v2(task: TaskCreateV2, db: Session = Depends(get_db)):
    """Create a new task with priority and deadline"""
    logger.info(f"[TASKS] Creating new task - Title: {task.title}, User: {task.user_id}")
    
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == task.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # Parse deadline
        deadline_dt = None
        if task.deadline:
            try:
                deadline_dt = datetime.datetime.fromisoformat(task.deadline.replace('Z', '+00:00'))
            except:
                pass
        
        # Determine initial status
        status = "pending"
        if deadline_dt and deadline_dt < datetime.datetime.now():
            status = "overdue"
        
        # Create task
        new_task = Task(
            title=task.title,
            description=task.description,
            user_id=task.user_id,
            priority=task.priority,
            category=task.category,
            deadline=deadline_dt,
            status=status,
            completed=False
        )
        
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        
        logger.info(f"[TASKS] Task created - ID: {new_task.id}, Title: {new_task.title}")
        
        return {
            "message": "Task berhasil dibuat!",
            "task_id": new_task.id,
            "title": new_task.title,
            "status": new_task.status,
            "priority": new_task.priority
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[TASKS] Error creating task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.put("/tasks/v2/{task_id}")
async def update_task_v2(task_id: int, task_update: TaskUpdateV2, db: Session = Depends(get_db)):
    """Update a task (title, status, priority, etc.)"""
    logger.info(f"[TASKS] Updating task {task_id}")
    
    try:
        # Find task
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task tidak ditemukan")
        
        # Update fields
        if task_update.title is not None:
            task.title = task_update.title
        if task_update.description is not None:
            task.description = task_update.description
        if task_update.priority is not None:
            task.priority = task_update.priority
        if task_update.status is not None:
            task.status = task_update.status
        if task_update.category is not None:
            task.category = task_update.category
        if task_update.deadline is not None:
            try:
                task.deadline = datetime.datetime.fromisoformat(task_update.deadline.replace('Z', '+00:00'))
            except:
                pass
        if task_update.completed is not None:
            task.completed = task_update.completed
            if task_update.completed:
                task.status = "completed"
                task.completed_at = datetime.datetime.now()
            else:
                task.completed_at = None
        
        task.updated_at = datetime.datetime.now()
        
        db.commit()
        db.refresh(task)
        
        logger.info(f"[TASKS] Task updated - ID: {task_id}, Status: {task.status}")
        
        return {
            "message": "Task berhasil diupdate!",
            "task_id": task.id,
            "title": task.title,
            "status": task.status,
            "completed": task.completed
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[TASKS] Error updating task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.delete("/tasks/v2/{task_id}")
async def delete_task_v2(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    logger.info(f"[TASKS] Deleting task {task_id}")
    
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task tidak ditemukan")
        
        title = task.title
        db.delete(task)
        db.commit()
        
        logger.info(f"[TASKS] Task deleted - ID: {task_id}, Title: {title}")
        
        return {
            "message": f"Task '{title}' berhasil dihapus!",
            "task_id": task_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[TASKS] Error deleting task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/tasks/stats/{user_id}")
async def get_task_stats(user_id: int, db: Session = Depends(get_db)):
    """Get task statistics for a user"""
    logger.info(f"[TASKS] Fetching task stats for user {user_id}")
    
    try:
        # Verify user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # Get all user tasks
        all_tasks = db.query(Task).filter(Task.user_id == user_id).all()
        
        # Calculate stats
        total = len(all_tasks)
        completed = len([t for t in all_tasks if t.completed])
        pending = len([t for t in all_tasks if t.status == "pending"])
        in_progress = len([t for t in all_tasks if t.status == "in_progress"])
        overdue = len([t for t in all_tasks if t.status == "overdue"])
        
        # Priority breakdown
        high_priority = len([t for t in all_tasks if t.priority in ["high", "urgent"] and not t.completed])
        
        # Completion rate
        completion_rate = round((completed / total * 100), 1) if total > 0 else 0.0
        
        logger.info(f"[TASKS] User {user.name} stats - Total: {total}, Completed: {completed}, Rate: {completion_rate}%")
        
        return {
            "user_name": user.name,
            "total_tasks": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
            "overdue": overdue,
            "high_priority": high_priority,
            "completion_rate": completion_rate
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[TASKS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

# ==================== REPORT ENDPOINTS ====================

@app.get("/reports/attendance-summary")
async def get_attendance_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get attendance summary report with filters"""
    logger.info("[REPORTS] Generating attendance summary")
    
    try:
        # Default to current month
        if not start_date:
            current_time = get_wib_time()
            start_date = current_time.replace(day=1).strftime("%Y-%m-%d")
        if not end_date:
            current_time = get_wib_time()
            last_day = (current_time.replace(day=28) + datetime.timedelta(days=4)).replace(day=1) - datetime.timedelta(days=1)
            end_date = last_day.strftime("%Y-%m-%d")
        
        # Build query
        query = db.query(Attendance, User).join(User).filter(
            and_(
                Attendance.date >= start_date,
                Attendance.date <= end_date
            )
        )
        
        if user_id:
            query = query.filter(Attendance.user_id == user_id)
        
        attendances = query.all()
        
        # Group by user
        user_summaries = {}
        for att, user in attendances:
            if user.id not in user_summaries:
                user_summaries[user.id] = {
                    "user_id": user.id,
                    "user_name": user.name,
                    "total_days": 0,
                    "on_time": 0,
                    "late": 0,
                    "total_hours": 0.0
                }
            
            user_summaries[user.id]["total_days"] += 1
            if att.status == "on_time":
                user_summaries[user.id]["on_time"] += 1
            elif att.status == "late":
                user_summaries[user.id]["late"] += 1
            
            if att.work_hours:
                user_summaries[user.id]["total_hours"] += att.work_hours
        
        # Calculate averages
        for user_id in user_summaries:
            summary = user_summaries[user_id]
            if summary["total_days"] > 0:
                summary["avg_hours"] = round(summary["total_hours"] / summary["total_days"], 2)
                summary["on_time_rate"] = round((summary["on_time"] / summary["total_days"]) * 100, 1)
            else:
                summary["avg_hours"] = 0.0
                summary["on_time_rate"] = 0.0
        
        result = list(user_summaries.values())
        
        logger.info(f"[REPORTS] Attendance summary generated - {len(result)} users")
        
        return {
            "period": f"{start_date} to {end_date}",
            "total_users": len(result),
            "summaries": result
        }
    
    except Exception as e:
        logger.error(f"[REPORTS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/reports/task-summary")
async def get_task_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get task completion summary report"""
    logger.info("[REPORTS] Generating task summary")
    
    try:
        # Default to current month
        if not start_date:
            start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.datetime.now().strftime("%Y-%m-%d")
        
        # Build query
        query = db.query(Task, User).join(User).filter(
            and_(
                Task.created_at >= start_date,
                Task.created_at <= end_date
            )
        )
        
        if user_id:
            query = query.filter(Task.user_id == user_id)
        
        tasks = query.all()
        
        # Group by user
        user_summaries = {}
        for task, user in tasks:
            if user.id not in user_summaries:
                user_summaries[user.id] = {
                    "user_id": user.id,
                    "user_name": user.name,
                    "total_tasks": 0,
                    "completed": 0,
                    "in_progress": 0,
                    "overdue": 0,
                    "high_priority": 0
                }
            
            user_summaries[user.id]["total_tasks"] += 1
            if task.completed:
                user_summaries[user.id]["completed"] += 1
            if task.status == "in_progress":
                user_summaries[user.id]["in_progress"] += 1
            if task.status == "overdue":
                user_summaries[user.id]["overdue"] += 1
            if task.priority in ["high", "urgent"]:
                user_summaries[user.id]["high_priority"] += 1
        
        # Calculate completion rate
        for user_id in user_summaries:
            summary = user_summaries[user_id]
            if summary["total_tasks"] > 0:
                summary["completion_rate"] = round((summary["completed"] / summary["total_tasks"]) * 100, 1)
            else:
                summary["completion_rate"] = 0.0
        
        result = list(user_summaries.values())
        
        logger.info(f"[REPORTS] Task summary generated - {len(result)} users")
        
        return {
            "period": f"{start_date} to {end_date}",
            "total_users": len(result),
            "summaries": result
        }
    
    except Exception as e:
        logger.error(f"[REPORTS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/reports/productivity-report")
async def get_productivity_report(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get comprehensive productivity report"""
    logger.info("[REPORTS] Generating productivity report")
    
    try:
        # Get date ranges
        today = datetime.datetime.now()
        start_of_month = today.replace(day=1)
        
        # Build user query
        users_query = db.query(User)
        if user_id:
            users_query = users_query.filter(User.id == user_id)
        
        users = users_query.all()
        
        result = []
        for user in users:
            # Attendance stats
            attendances = db.query(Attendance).filter(
                and_(
                    Attendance.user_id == user.id,
                    Attendance.date >= start_of_month.strftime("%Y-%m-%d")
                )
            ).all()
            
            total_attendance = len(attendances)
            on_time_count = len([a for a in attendances if a.status == "on_time"])
            total_hours = sum([a.work_hours for a in attendances if a.work_hours])
            avg_hours = round(total_hours / total_attendance, 2) if total_attendance > 0 else 0.0
            
            # Task stats
            tasks = db.query(Task).filter(
                and_(
                    Task.user_id == user.id,
                    Task.created_at >= start_of_month
                )
            ).all()
            
            total_tasks = len(tasks)
            completed_tasks = len([t for t in tasks if t.completed])
            completion_rate = round((completed_tasks / total_tasks) * 100, 1) if total_tasks > 0 else 0.0
            
            # Calculate productivity score (0-100)
            # Formula: (attendance_rate * 0.4) + (completion_rate * 0.4) + (on_time_rate * 0.2)
            attendance_rate = (total_attendance / 22) * 100  # Assume 22 working days
            on_time_rate = (on_time_count / total_attendance * 100) if total_attendance > 0 else 0
            productivity_score = round(
                (min(attendance_rate, 100) * 0.4) + 
                (completion_rate * 0.4) + 
                (on_time_rate * 0.2),
                1
            )
            
            result.append({
                "user_id": user.id,
                "user_name": user.name,
                "attendance_days": total_attendance,
                "on_time_days": on_time_count,
                "avg_work_hours": avg_hours,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "task_completion_rate": completion_rate,
                "productivity_score": productivity_score,
                "grade": "A" if productivity_score >= 90 else "B" if productivity_score >= 75 else "C" if productivity_score >= 60 else "D"
            })
        
        logger.info(f"[REPORTS] Productivity report generated - {len(result)} users")
        
        return {
            "month": today.strftime("%B %Y"),
            "total_users": len(result),
            "reports": result
        }
    
    except Exception as e:
        logger.error(f"[REPORTS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

