from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, database, models

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.post("/", response_model=schemas.Ingredient)
def create_or_update_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(database.get_db)):
    existing = db.query(models.Ingredient).filter(
        models.Ingredient.name.ilike(ingredient.name.strip())
    ).first()

    if existing:
        existing.stock += ingredient.stock
        db.commit()
        db.refresh(existing)
        return existing

    return crud.create_ingredient(db, ingredient)

@router.get("/", response_model=list[schemas.Ingredient])
def list_ingredients(db: Session = Depends(database.get_db)):
    return crud.get_all_ingredients(db)

@router.delete("/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(database.get_db)):
    ingredient = db.query(models.Ingredient).get(ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    db.delete(ingredient)
    db.commit()
    return {"message": "Ingrediente eliminado correctamente"}
