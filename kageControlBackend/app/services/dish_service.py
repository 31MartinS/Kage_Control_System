from sqlalchemy.orm import Session
from app.repository import dish_repo
from app.schemas.dish import DishCreate

def create_dish(db: Session, data: DishCreate):
    return dish_repo.create_dish(db, data)

def get_available_dishes(db: Session):
    return dish_repo.get_available_dishes(db)
