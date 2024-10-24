import uuid
from sqlalchemy import Column, INT, String, DateTime, Float, Boolean
from sqlalchemy.sql import func
from .database import Base

class LadleHistory(Base):
    __tablename__ = "ladle_history"
    id = Column(INT, primary_key=True, index=True)
    cameraId = Column(String(36), index=True)
    ladleId = Column(String(36), index=True)
    temperature = Column(Float, index=True)
    arrival_time = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    departure_time = Column(DateTime(timezone=True), server_default=func.now(), index=True)

class LadleMaintainanceHistory(Base):
    __tablename__ = "ladle_maintainance_history"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    ladleId = Column(String(36), index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    maintainedBy = Column(String(36), index=True)
    
class User(Base):
    __tablename__ = "user"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True)
    role = Column(String(36), index=True)
    password = Column(String(255), index=True)
    reset_token = Column(String(255), index=True)
    
class CameraFeed(Base):
    __tablename__ = "camerafeeds"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    unitId = Column(String(36), index=True)
    subunit = Column(String(255), index=True)
    location = Column(String(255), index=True)
    camera_url = Column(String(255), index=True)
    state = Column(Boolean, index=True)
    ladleId = Column(String(36), index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    last_detection = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
class SmsUnit(Base):
    __tablename__ = "smsunits"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    unitId = Column(String(255), unique=True, index=True)
    
class Ladle(Base):
    __tablename__ = "ladles"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    unitId = Column(String(36), index=True)
    ladleId = Column(String(36), index=True)
    grade = Column(String(255), index=True)
    capacity = Column(Float, index=True)
    weight = Column(Float, index=True)
    temperature = Column(Float, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
