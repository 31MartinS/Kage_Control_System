from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import dish_service
from app.schemas import DishCreate, Dish
from typing import List

router = APIRouter(prefix="/menu", tags=["menu"])

@router.get("/available", response_model=List[Dish])
def list_available_dishes(db: Session = Depends(get_db)):
    return dish_service.get_available_dishes(db)

@router.post("/", response_model=Dish)
def create_dish(dish: DishCreate, db: Session = Depends(get_db)):
    return dish_service.create_dish(db, dish)
