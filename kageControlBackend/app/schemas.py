from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional
from .models import TableStatus, OrderStatus, UserRole

class TableBase(BaseModel):
    name: str
    capacity: int

class Table(TableBase):
    id: int
    status: TableStatus

    model_config = ConfigDict(from_attributes=True)

class TableUpdate(BaseModel):
    status: TableStatus

    model_config = ConfigDict(from_attributes=True)

class TableSchema(BaseModel):
    id: int
    name: str
    capacity: int
    status: str

    model_config = ConfigDict(from_attributes=True)

class TableCreate(BaseModel):
    name: str
    capacity: int

class TableResponse(BaseModel):
    id: int
    name: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class ArrivalBase(BaseModel):
    customer_name: str
    party_size: int
    contact: Optional[str]
    preferences: Optional[str]

class ArrivalCreate(ArrivalBase): pass

class Arrival(ArrivalBase):
    id: int
    table_id: int
    assigned_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderDishCreate(BaseModel):
    dish_id: int
    quantity: int

class OrderBase(BaseModel):
    arrival_id: int
    station: str
    notes: Optional[str]
    dishes: List[OrderDishCreate]  # NUEVO

# Primero define un modelo Pydantic para Dish si no lo tienes aún:
class DishSchema(BaseModel):
    id: int
    name: str
    price: float

    model_config = ConfigDict(from_attributes=True)
class OrderDish(BaseModel):
    dish: DishSchema  # ✅ Ahora sí es compatible con Pydantic
    quantity: int


class OrderCreate(OrderBase): pass

class Order(OrderBase):
    id: int
    status: OrderStatus

    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone: str
    role: UserRole
    hire_date: date

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"



class Ingredient(BaseModel):
    id: int
    name: str
    quantity: float
    unit: str

    model_config = ConfigDict(from_attributes=True)

class IngredientBase(BaseModel):
    name: str
    stock: float

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DishIngredientCreate(BaseModel):
    ingredient_id: int
    quantity_needed: float

class DishBase(BaseModel):
    name: str
    description: str
    price: float  # <-- NUEVO

class DishCreate(DishBase):
    ingredients: List[DishIngredientCreate]

class Dish(DishBase):
    id: int
    model_config = ConfigDict(from_attributes=True)