from datetime import datetime, date
from pydantic import BaseModel, EmailStr
from typing import Optional
from .models import TableStatus, OrderStatus, UserRole

class TableBase(BaseModel):
    name: str
    capacity: int

class Table(TableBase):
    id: int
    status: TableStatus
    class Config:
        orm_mode = True

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
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    arrival_id: int
    item: str
    quantity: int
    notes: Optional[str]
    station: str

class OrderCreate(OrderBase): pass

class Order(OrderBase):
    id: int
    status: OrderStatus
    class Config:
        orm_mode = True

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
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"