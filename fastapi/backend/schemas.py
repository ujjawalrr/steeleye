from pydantic import BaseModel

class CameraFeedBase(BaseModel):
    cameraId: str
    ladleId: str
    
class SmsUnitBase(BaseModel):
    unitId: str

class LadleBase(BaseModel):
    unitId: str
    ladleId: str

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

