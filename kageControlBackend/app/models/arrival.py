from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

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
