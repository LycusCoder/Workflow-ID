from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import get_db, User, Attendance, Task
from pydantic import BaseModel
from typing import List
import datetime

app = FastAPI(title="WorkFlow ID Backend", version="1.0.0")

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

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

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

class AttendanceCreate(BaseModel):
    user_id: int

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime.datetime

@app.get("/")
async def root():
    return {"message": "WorkFlow ID API"}

@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users", response_model=List[UserResponse])
async def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

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

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, completed: bool, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.completed = completed
    db.commit()
    return task
