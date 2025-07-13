from sqlalchemy.orm import Session
from app.repository import order_repo
from app.schemas.order import OrderCreate
from app.models.order import OrderStatus

def create_order(db: Session, data: OrderCreate):
    return order_repo.create_order(db, data)

def get_orders_by_arrival(db: Session, arrival_id: int):
    return order_repo.get_orders_by_arrival(db, arrival_id)

def get_all_orders(db: Session):
    return order_repo.get_all_orders(db)

def update_order_status(db: Session, order_id: int, status: OrderStatus):
    return order_repo.update_order_status(db, order_id, status)
