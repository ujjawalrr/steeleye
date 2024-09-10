from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func
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

@app.delete("/api/deleteUnit/{id}", response_model=schemas.SmsUnit)
def delete_unit(id: int, db: Session = Depends(get_db)):
    unit = db.query(models.SmsUnit).filter(models.SmsUnit.id == id).first()
    
    if not unit:
        raise HTTPException(status_code=404, detail="SMS Unit not found")
    
    db.delete(unit)
    db.commit()
    
    return unit

@app.get("/api/ladle-history/{unitId}/{ladleId}", response_model=list[schemas.LadleHistory])
def get_unit_ladles(unitId: str, ladleId: str, db: Session = Depends(get_db)):
    history = db.query(models.LadleHistory).filter((models.LadleHistory.unitId == unitId) & (models.LadleHistory.ladleId == ladleId)).order_by(desc(models.LadleHistory.timestamp)).all()
    if not history:
        raise HTTPException(status_code=404, detail="History not found for the specified ladle")
    return history

@app.get("/api/cycle-count/{unitId}/{ladleId}", response_model=int)
def get_cycle_count(unitId: str, ladleId: str, db: Session = Depends(get_db)):
    count = db.query(func.count()).filter(
        (models.LadleHistory.cameraId == f"{unitId.replace(" ", "")}_01") &
        (models.LadleHistory.unitId == unitId) &
        (models.LadleHistory.ladleId == ladleId)
    ).scalar()

    if count == 0:
        raise HTTPException(status_code=404, detail="No history found for the specified ladle")

    return count