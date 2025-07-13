from sqlalchemy import Column, Integer, String, Enum
from app.core.database import Base
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
