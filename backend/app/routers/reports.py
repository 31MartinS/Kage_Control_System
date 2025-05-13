from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from .. import database, models

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/attendance")
def attendance_report(start: datetime, end: datetime, db: Session = Depends(database.get_db)):
    count = db.query(models.Arrival).filter(models.Arrival.assigned_at.between(start, end)).count()
    return {"start": start, "end": end, "groups": count}
