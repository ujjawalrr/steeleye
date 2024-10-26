from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LadleHistoryBase(BaseModel):
    location: str
    ladleId: str
    temperature: float
    arrival_time: datetime
    departure_time: datetime
    
class LadleMaintainanceHistoryBase(BaseModel):
    ladleId: str
    assigned_at: datetime
    maintainedBy: str
    delivered_at: Optional[datetime]
    
class UserBase(BaseModel):
    name: str
    email: str
    role: str
    
class CameraFeedBase(BaseModel):
    unitId: str
    subunit: str
    location: str
    camera_url: str
    state: bool
    ladleId: str
    timestamp: datetime
    last_detection: datetime
    
class SmsUnitBase(BaseModel):
    unitId: str

class LadleBase(BaseModel):
    unitId: str
    ladleId: str
    grade: str
    capacity: float
    weight: float
    temperature: float
    timestamp: datetime

class LadleHistoryCreate(LadleHistoryBase):
    pass

class LadleHistory(LadleHistoryBase):
    id: int

    class Config:
        from_attributes = True
        
class LadleMaintainanceHistoryCreate(LadleMaintainanceHistoryBase):
    pass

class LadleMaintainanceHistory(LadleMaintainanceHistoryBase):
    id: str

    class Config:
        from_attributes = True
        
class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str

    class Config:
        from_attributes = True
        
class CameraFeedCreate(CameraFeedBase):
    pass

class CameraFeed(CameraFeedBase):
    id: str

    class Config:
        from_attributes = True

class SmsUnitCreate(SmsUnitBase):
    pass

class SmsUnit(SmsUnitBase):
    id: str

    class Config:
        from_attributes = True

class LadleCreate(LadleBase):
    pass

class Ladle(LadleBase):
    id: str

    class Config:
        from_attributes = True

