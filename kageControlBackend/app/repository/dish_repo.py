from sqlalchemy.orm import Session, joinedload
from app.models.dish import Dish
from app.models.ingredient import DishIngredient
from app.schemas.dish import DishCreate

def create_dish(db: Session, dish_data: DishCreate):
    dish = Dish(
        name=dish_data.name,
        description=dish_data.description,
        price=dish_data.price
    )
    db.add(dish)
    db.commit()
    db.refresh(dish)

    for ing in dish_data.ingredients:
        di = DishIngredient(
            dish_id=dish.id,
            ingredient_id=ing.ingredient_id,
            quantity_needed=ing.quantity_needed
        )
        db.add(di)
    db.commit()
    return dish

def get_all_dishes(db: Session):
    return db.query(Dish).options(joinedload(Dish.ingredients)).all()

def get_available_dishes(db: Session):
    dishes = db.query(Dish).options(joinedload(Dish.ingredients)).all()
    available = []
    for dish in dishes:
        enough = all(di.ingredient.stock >= di.quantity_needed for di in dish.ingredients)
        if enough:
            available.append(dish)
    return available
