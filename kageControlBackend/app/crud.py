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
def get_all_arrivals(db: Session):
    return db.query(models.Arrival).all()

# Orders
def create_order(db: Session, data: schemas.OrderCreate):
    # Verificamos stock para todos los platos
    for od in data.dishes:
        dish = db.query(models.Dish).get(od.dish_id)
        if not dish:
            raise Exception(f"Dish with id {od.dish_id} not found.")
        for di in dish.ingredients:
            required = di.quantity_needed * od.quantity
            if di.ingredient.stock < required:
                raise Exception(f"No hay suficiente {di.ingredient.name} para el platillo {dish.name}.")

    # Creamos la orden
    order = models.Order(
        arrival_id=data.arrival_id,
        station=data.station,
        notes=data.notes,
        status=models.OrderStatus.sent
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Asociamos los platos a la orden y consumimos ingredientes
    for od in data.dishes:
        order_dish = models.OrderDish(
            order_id=order.id,
            dish_id=od.dish_id,
            quantity=od.quantity
        )
        db.add(order_dish)

        dish = db.query(models.Dish).get(od.dish_id)
        for di in dish.ingredients:
            di.ingredient.stock -= di.quantity_needed * od.quantity

    db.commit()
    db.refresh(order)
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
def get_all_users(db: Session):
    return db.query(models.User).all()

#Inventario

def create_ingredient(db: Session, ingredient: schemas.IngredientCreate):
    db_ingredient = models.Ingredient(**ingredient.dict())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

def create_dish(db: Session, dish_data: schemas.DishCreate):
    dish = models.Dish(
        name=dish_data.name,
        description=dish_data.description,
        price=dish_data.price  # <-- NUEVO
    )
    db.add(dish)
    db.commit()
    db.refresh(dish)

    for ing in dish_data.ingredients:
        di = models.DishIngredient(
            dish_id=dish.id,
            ingredient_id=ing.ingredient_id,
            quantity_needed=ing.quantity_needed
        )
        db.add(di)
    db.commit()
    return dish

def get_available_dishes(db: Session):
    dishes = db.query(models.Dish).all()
    available = []
    for dish in dishes:
        enough_stock = True
        for di in dish.ingredients:
            if di.ingredient.stock < di.quantity_needed:
                enough_stock = False
                break
        if enough_stock:
            available.append(dish)
    return available

def consume_ingredients_for_dish(db: Session, dish_id: int):
    dish = db.query(models.Dish).filter_by(id=dish_id).first()
    if not dish:
        return None
    for di in dish.ingredients:
        if di.ingredient.stock < di.quantity_needed:
            raise Exception("No hay suficiente stock para este platillo.")
        di.ingredient.stock -= di.quantity_needed
    db.commit()

def get_all_ingredients(db: Session):
    return db.query(models.Ingredient).all()