from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
from .models import User, UserRole
from .schemas import UserCreate
from .auth import get_password_hash

# Tables
def get_tables(db: Session):
    return db.query(models.Table).all()

def update_table_status(db: Session, table_id: int, status: models.TableStatus):
    table = db.query(models.Table).get(table_id)
    table.status = status
    db.commit(); db.refresh(table)
    return table

# Arrivals
def create_arrival(db: Session, data: schemas.ArrivalCreate):
    table = db.query(models.Table).filter(models.Table.status == "free").first()
    if not table:
        return None
    update_table_status(db, table.id, models.TableStatus.occupied)
    a = models.Arrival(**data.dict(), table_id=table.id, assigned_at=datetime.utcnow())
    db.add(a); db.commit(); db.refresh(a)
    return a

# Orders
def create_order(db: Session, data: schemas.OrderCreate):
    order = models.Order(**data.dict(), status=models.OrderStatus.sent)
    db.add(order); db.commit(); db.refresh(order)
    return order

def get_orders_by_arrival(db: Session, arrival_id: int):
    return db.query(models.Order).filter(models.Order.arrival_id == arrival_id).all()

def update_order_status(db: Session, order_id: int, status: models.OrderStatus):
    order = db.query(models.Order).get(order_id)
    order.status = status
    db.commit(); db.refresh(order)
    return order
def get_all_orders(db: Session):
    return db.query(models.Order).all()


#Uusarios
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        hire_date=user.hire_date,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user