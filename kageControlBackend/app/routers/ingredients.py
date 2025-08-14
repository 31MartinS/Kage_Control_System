from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import ingredient_service
from app.schemas import IngredientCreate, Ingredient
from typing import List

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.post("/", response_model=Ingredient)
def create_or_update_ingredient(ingredient: IngredientCreate, db: Session = Depends(get_db)):
    return ingredient_service.create_or_update_ingredient(db, ingredient)

@router.put("/{ingredient_id}", response_model=Ingredient)
def update_ingredient(ingredient_id: int, ingredient: IngredientCreate, db: Session = Depends(get_db)):
    return ingredient_service.update_ingredient(db, ingredient_id, ingredient)

@router.get("/", response_model=List[Ingredient])
def list_ingredients(db: Session = Depends(get_db)):
    return ingredient_service.list_ingredients(db)

@router.delete("/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    success = ingredient_service.delete_ingredient(db, ingredient_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    return {"message": "Ingrediente eliminado correctamente"}
