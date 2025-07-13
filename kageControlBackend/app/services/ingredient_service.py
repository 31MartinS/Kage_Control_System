from sqlalchemy.orm import Session
from app.repository import ingredient_repo
from app.schemas.ingredient import IngredientCreate

def create_or_update_ingredient(db: Session, ingredient: IngredientCreate):
    existing = db.query(ingredient_repo.Ingredient).filter(
        ingredient_repo.Ingredient.name.ilike(ingredient.name.strip())
    ).first()

    if existing:
        existing.stock += ingredient.stock
        db.commit()
        db.refresh(existing)
        return existing

    return ingredient_repo.create_ingredient(db, ingredient)

def list_ingredients(db: Session):
    return ingredient_repo.get_all_ingredients(db)

def delete_ingredient(db: Session, ingredient_id: int):
    return ingredient_repo.delete_ingredient(db, ingredient_id)
