from sqlalchemy import Column, Integer, String, Date, Enum
from app.core.database import Base
import enum

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
