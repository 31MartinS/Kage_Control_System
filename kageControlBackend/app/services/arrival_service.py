from sqlalchemy.orm import Session
from app.repository import arrival_repo, table_repo
from app.schemas.arrival import ArrivalCreate

def create_arrival(db: Session, data: ArrivalCreate):
    return arrival_repo.create_arrival(db, data)

def list_arrivals(db: Session):
    return arrival_repo.get_all_arrivals(db)
