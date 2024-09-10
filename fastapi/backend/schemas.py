from pydantic import BaseModel
from datetime import datetime

class LadleHistoryBase(BaseModel):
    cameraId: str
    unitId: str
    ladleId: str
    timestamp: datetime
    
class CameraFeedBase(BaseModel):
    cameraId: str
    unitId: str
    ladleId: str
    camera_url: str
    timestamp: datetime
    
class SmsUnitBase(BaseModel):
    unitId: str

class LadleBase(BaseModel):
    unitId: str
    ladleId: str

class LadleHistoryCreate(LadleHistoryBase):
    pass

class LadleHistory(LadleHistoryBase):
    id: int

    class Config:
        from_attributes = True
        
class CameraFeedCreate(CameraFeedBase):
    pass

class CameraFeed(CameraFeedBase):
    id: int

    class Config:
        from_attributes = True

class SmsUnitCreate(SmsUnitBase):
    pass

class SmsUnit(SmsUnitBase):
    id: int

    class Config:
        from_attributes = True

class LadleCreate(LadleBase):
    pass

class Ladle(LadleBase):
    id: int

    class Config:
        from_attributes = True

