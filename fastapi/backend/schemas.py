from pydantic import BaseModel

class CameraFeedBase(BaseModel):
    cameraId: str
    ladleId: str

class CameraFeedCreate(CameraFeedBase):
    pass

class CameraFeed(CameraFeedBase):
    id: int

    class Config:
        from_attributes = True

