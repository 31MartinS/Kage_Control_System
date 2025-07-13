from sqlalchemy.orm import Session
from datetime import datetime
from app.models.arrival import Arrival
from app.models.table import TableStatus
from app.schemas.arrival import ArrivalCreate
from app.models import Table

def create_arrival(db: Session, data: ArrivalCreate):
    table = db.query(Table).filter(Table.status == TableStatus.free).first()
    if not table:
        return None
    table.status = TableStatus.occupied
    a = Arrival(**data.dict(), table_id=table.id, assigned_at=datetime.utcnow())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

def get_all_arrivals(db: Session):
    return db.query(Arrival).all()
