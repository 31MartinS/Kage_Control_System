from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, crud, database

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.post("/", response_model=schemas.Ingredient)
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(database.get_db)):
    """
    Crea un nuevo ingrediente con su cantidad en stock.
    """
    return crud.create_ingredient(db, ingredient)


@router.get("/", response_model=List[schemas.Ingredient])
def list_ingredients(db: Session = Depends(database.get_db)):
    return crud.get_all_ingredients(db)