from sqlalchemy import Column, Float, Integer, String, DateTime, Enum, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from .database import Base
import enum

class TableStatus(str, enum.Enum):
    free = "free"
    reserved = "reserved"
    occupied = "occupied"
    cleaning = "cleaning"

class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(Enum(TableStatus), default=TableStatus.free)

class Arrival(Base):
    __tablename__ = "arrivals"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    party_size = Column(Integer, nullable=False)
    contact = Column(String(20))
    preferences = Column(Text)
    table_id = Column(Integer, ForeignKey("tables.id"))
    assigned_at = Column(DateTime)
    table = relationship("Table")

class OrderStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    in_preparation = "in_preparation"
    ready = "ready"
    served = "served"

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    arrival_id = Column(Integer, ForeignKey("arrivals.id"))
    quantity = Column(Integer, default=1)
    notes = Column(Text)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    station = Column(String(50))
    arrival = relationship("Arrival")
    dishes = relationship("OrderDish", back_populates="order")  # NUEVO

class OrderDish(Base):
    __tablename__ = "order_dishes"
    order_id = Column(Integer, ForeignKey("orders.id"), primary_key=True)
    dish_id = Column(Integer, ForeignKey("dishes.id"), primary_key=True)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="dishes")
    dish = relationship("Dish")

class UserRole(str, enum.Enum):
    mesero = "mesero"
    cocina = "cocina"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    role = Column(Enum(UserRole), nullable=False)
    hire_date = Column(Date)
    hashed_password = Column(String(128), nullable=False)
    estado = Column(String(20), default="activo")


class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    stock = Column(Float)  # cantidad disponible (kg, litros, unidades, etc.)

    dishes = relationship("DishIngredient", back_populates="ingredient")

class Dish(Base):
    __tablename__ = "dishes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255))

    price = Column(Float)  # <-- NUEVO

    ingredients = relationship("DishIngredient", back_populates="dish")

class DishIngredient(Base):
    __tablename__ = "dish_ingredients"
    dish_id = Column(Integer, ForeignKey("dishes.id"), primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), primary_key=True)
    quantity_needed = Column(Float)  # cantidad requerida de este ingrediente

    dish = relationship("Dish", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="dishes")