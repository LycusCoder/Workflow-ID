from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import get_db, User, Attendance, Task
from pydantic import BaseModel
from typing import List, Optional
import datetime
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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    face_embedding: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    face_embedding: Optional[str] = None

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

class AttendanceCreate(BaseModel):
    user_id: int

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime.datetime

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
    
    db_user = User(name=user.name, email=user.email, face_embedding=user.face_embedding)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    print(f"[CREATE_USER] User created successfully - ID: {db_user.id}, Name: {db_user.name}")
    logger.info(f"[CREATE_USER] User created successfully - ID: {db_user.id}, Name: {db_user.name}")
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

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    print(f"[UPDATE_USER] Updating user - ID: {user_id}")
    logger.info(f"[UPDATE_USER] Updating user - ID: {user_id}")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        print(f"[UPDATE_USER] User not found - ID: {user_id}")
        logger.error(f"[UPDATE_USER] User not found - ID: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.face_embedding is not None:
        embedding_length = len(user_update.face_embedding) if user_update.face_embedding else 0
        print(f"[UPDATE_USER] Updating face embedding - User ID: {user_id}, Embedding length: {embedding_length}")
        logger.info(f"[UPDATE_USER] Updating face embedding - User ID: {user_id}, Embedding length: {embedding_length}")
        user.face_embedding = user_update.face_embedding
    
    db.commit()
    db.refresh(user)
    
    print(f"[UPDATE_USER] User updated successfully - ID: {user_id}, Name: {user.name}")
    logger.info(f"[UPDATE_USER] User updated successfully - ID: {user_id}, Name: {user.name}")
    return user

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, completed: bool, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = completed
    db.commit()
    return task
