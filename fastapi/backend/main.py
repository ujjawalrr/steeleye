from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.get("/")
def test_api():
    return "Hello World!"

@app.get("/api/camerafeeds/", response_model=list[schemas.CameraFeed])
def get_feeds(db: Session = Depends(get_db)):
    return db.query(models.CameraFeed).all()

# @app.post("/todos/", response_model=schemas.TodoItem)
# def create_todo(todo: schemas.TodoItemCreate, db: Session = Depends(get_db)):
#     db_todo = models.TodoItem(**todo.dict())
#     db.add(db_todo)
#     db.commit()
#     db.refresh(db_todo)
#     return db_todo

# @app.get("/todos/", response_model=list[schemas.TodoItem])
# def read_todos(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
#     return db.query(models.TodoItem).offset(skip).limit(limit).all()