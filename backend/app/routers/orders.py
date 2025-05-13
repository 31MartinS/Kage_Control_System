from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.Order)
def create_order(data: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    return crud.create_order(db, data)

@router.get("/{arrival_id}", response_model=list[schemas.Order])
def list_orders(arrival_id: int, db: Session = Depends(database.get_db)):
    return crud.get_orders_by_arrival(db, arrival_id)
