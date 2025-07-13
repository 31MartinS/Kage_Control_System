from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.schemas.dish import DishSchema
from app.models.order import OrderStatus

class OrderDishCreate(BaseModel):
    dish_id: int
    quantity: int

class OrderDish(BaseModel):
    dish: DishSchema
    quantity: int

class OrderBase(BaseModel):
    arrival_id: int
    station: str
    notes: Optional[str]
    dishes: List[OrderDishCreate]

class OrderCreate(OrderBase): pass

class Order(OrderBase):
    id: int
    status: OrderStatus

    model_config = ConfigDict(from_attributes=True)
