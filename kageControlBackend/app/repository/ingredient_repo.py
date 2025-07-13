from sqlalchemy.orm import Session
from app.models.ingredient import Ingredient
from app.schemas.ingredient import IngredientCreate

def create_ingredient(db: Session, ingredient: IngredientCreate):
    db_ingredient = Ingredient(**ingredient.dict())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

def get_all_ingredients(db: Session):
    return db.query(Ingredient).all()

def delete_ingredient(db: Session, ingredient_id: int):
    ing = db.query(Ingredient).get(ingredient_id)
    if not ing:
        return False
    db.delete(ing)
    db.commit()
    return True
