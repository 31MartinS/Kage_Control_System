from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

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
    dishes = relationship("OrderDish", back_populates="order")

class OrderDish(Base):
    __tablename__ = "order_dishes"
    order_id = Column(Integer, ForeignKey("orders.id"), primary_key=True)
    dish_id = Column(Integer, ForeignKey("dishes.id"), primary_key=True)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="dishes")
    dish = relationship("Dish")
