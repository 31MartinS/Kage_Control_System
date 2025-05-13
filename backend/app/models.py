from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, Date
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
    item = Column(String(100), nullable=False)
    quantity = Column(Integer, default=1)
    notes = Column(Text)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    station = Column(String(50))
    arrival = relationship("Arrival")


class UserRole(str, enum.Enum):
    waiter = "waiter"
    cook = "cook"
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