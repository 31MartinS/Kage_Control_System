from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, database, models

router = APIRouter(prefix="/kitchen", tags=["kitchen"])

@router.post("/update-status/{order_id}")
def change_status(order_id: int, new_status: models.OrderStatus, db: Session = Depends(database.get_db)):
    return crud.update_order_status(db, order_id, new_status)
