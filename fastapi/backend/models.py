from sqlalchemy import Column, Integer, String
from .database import Base

class CameraFeed(Base):
    __tablename__ = "camerafeeds"
    id = Column(Integer, primary_key=True, index=True)
    cameraId = Column(String(255), index=True)
    ladleId = Column(String(255), index=True)
    
class SmsUnit(Base):
    __tablename__ = "smsunits"
    id = Column(Integer, primary_key=True, index=True)
    unitId = Column(String(255), index=True)
    
class Ladle(Base):
    __tablename__ = "ladles"
    id = Column(Integer, primary_key=True, index=True)
    ladleId = Column(String(255), index=True)
    unitId = Column(String(255), index=True)