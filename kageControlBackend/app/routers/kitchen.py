from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import order_service
from app.models.order import OrderStatus

router = APIRouter(prefix="/kitchen", tags=["kitchen"])

@router.post("/update-status/{order_id}")
def change_status(order_id: int, new_status: OrderStatus, db: Session = Depends(get_db)):
    return order_service.update_order_status(db, order_id, new_status)
