from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc
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

@app.get("/api/smsunits/", response_model=list[schemas.SmsUnit])
def get_units(db: Session = Depends(get_db)):
    return db.query(models.SmsUnit).all()

@app.get("/api/unitladles/{unitId}", response_model=list[schemas.Ladle])
def get_unit_ladles(unitId: str, db: Session = Depends(get_db)):
    ladles = db.query(models.Ladle).filter(models.Ladle.unitId == unitId).order_by(asc(models.Ladle.ladleId)).all()
    if not ladles:
        raise HTTPException(status_code=404, detail="Ladles not found for the specified unit")
    return ladles

@app.post("/api/addNewLadle/", response_model=schemas.Ladle)
def add_new_ladle(ladle: schemas.LadleCreate, db: Session = Depends(get_db)):
    db_ladle = models.Ladle(**ladle.dict())
    
    db.add(db_ladle)
    
    db.commit()
    
    db.refresh(db_ladle)
    
    return db_ladle

@app.delete("/api/deleteLadle/{id}", response_model=schemas.Ladle)
def delete_ladle(id: int, db: Session = Depends(get_db)):
    ladle = db.query(models.Ladle).filter(models.Ladle.id == id).first()
    
    if not ladle:
        raise HTTPException(status_code=404, detail="Ladle not found")
    
    db.delete(ladle)
    db.commit()
    
    return ladle