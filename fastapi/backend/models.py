from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

# class TodoItem(Base):
#     __tablename__ = "todo_items"
#     id = Column(Integer, primary_key=True, index=True)
#     title = Column(String(255), index=True)  # Specify length for VARCHAR
#     description = Column(String(255), index=True, nullable=True)  # Specify length for VARCHAR
#     completed = Column(Boolean, default=False)

class CameraFeed(Base):
    __tablename__ = "camerafeeds"
    id = Column(Integer, primary_key=True, index=True)
    cameraId = Column(String(255), index=True)
    ladleId = Column(String(255), index=True)
    
# class SmsUnit(Base):
#     __tablename__ = "smsunits"
#     id = Column(Integer, primary_key=True, index=True)
#     cameraId = Column(String(255), index=True)
#     ladleId = Column(String(255), index=True)