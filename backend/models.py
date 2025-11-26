from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, create_engine, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import pytz

DATABASE_URL = "sqlite:///./workflow.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    face_embedding = Column(String)  # Store JSON string of embedding
    gender = Column(String, default="other")  # male, female, other

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, index=True)  # Format: YYYY-MM-DD untuk unique constraint per hari
    check_in_time = Column(DateTime)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String, default="on_time")  # on_time, late, absent, leave
    work_hours = Column(Float, nullable=True)  # Total jam kerja (check_out - check_in)
    notes = Column(Text, nullable=True)  # Catatan tambahan
    location = Column(String, nullable=True)  # Lokasi absen (future: GPS tracking)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)  # Legacy compatibility

    user = relationship("User")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    completed = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    priority = Column(String, default="medium")  # low, medium, high, urgent
    status = Column(String, default="pending")  # pending, in_progress, completed, overdue
    category = Column(String, default="general")  # general, development, meeting, review, etc
    deadline = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String, default="meeting")  # meeting, deadline, training, holiday, other
    date = Column(String, nullable=False)  # Format: YYYY-MM-DD
    time = Column(String, nullable=False)  # Format: HH:MM
    location = Column(String, nullable=True)
    attendees = Column(Text, nullable=True)  # Comma-separated user IDs or names
    status = Column(String, default="scheduled")  # scheduled, ongoing, completed, cancelled
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("User", foreign_keys=[created_by])

Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
