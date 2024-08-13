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


# class TodoItemBase(BaseModel):
#     title: str
#     description: str | None = None
#     completed: bool = False

# class TodoItemCreate(TodoItemBase):
#     pass

# class TodoItem(TodoItemBase):
#     id: int

#     class Config:
#         from_attributes = True
