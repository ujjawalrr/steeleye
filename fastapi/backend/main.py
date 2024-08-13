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
