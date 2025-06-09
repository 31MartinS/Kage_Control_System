from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, crud, database

router = APIRouter(prefix="/menu", tags=["menu"])

@router.get("/available", response_model=list[schemas.Dish])
def list_available_dishes(db: Session = Depends(database.get_db)):
    """
    Devuelve la lista de platillos que tienen suficientes ingredientes en stock para ser vendidos.
    """
    return crud.get_available_dishes(db)

@router.post("/", response_model=schemas.Dish)
def create_dish(dish: schemas.DishCreate, db: Session = Depends(database.get_db)):
    """
    Crea un nuevo platillo con sus ingredientes y cantidades necesarias.
    """
    return crud.create_dish(db, dish)
