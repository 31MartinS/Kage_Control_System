from sqlalchemy.orm import Session
from app.models.order import Order, OrderStatus, OrderDish
from app.models.dish import Dish
from app.schemas.order import OrderCreate
from app.models.ingredient import DishIngredient

def create_order(db: Session, data: OrderCreate):
    # Verificar stock
    for od in data.dishes:
        dish = db.query(Dish).get(od.dish_id)
        if not dish:
            raise Exception(f"Platillo {od.dish_id} no encontrado")
        for di in dish.ingredients:
            required = di.quantity_needed * od.quantity
            if di.ingredient.stock < required:
                raise Exception(f"No hay suficiente {di.ingredient.name} para {dish.name}")

    order = Order(
        arrival_id=data.arrival_id,
        station=data.station,
        notes=data.notes,
        status=OrderStatus.pending
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for od in data.dishes:
        order_dish = OrderDish(order_id=order.id, dish_id=od.dish_id, quantity=od.quantity)
        db.add(order_dish)
        dish = db.query(Dish).get(od.dish_id)
        for di in dish.ingredients:
            di.ingredient.stock -= di.quantity_needed * od.quantity

    db.commit()
    db.refresh(order)
    return order

def get_orders_by_arrival(db: Session, arrival_id: int):
    return db.query(Order).filter(Order.arrival_id == arrival_id).all()

def get_all_orders(db: Session):
    return db.query(Order).all()

def update_order_status(db: Session, order_id: int, status: OrderStatus):
    order = db.query(Order).get(order_id)
    if not order:
        return None
    order.status = status
    db.commit()
    db.refresh(order)
    return order
