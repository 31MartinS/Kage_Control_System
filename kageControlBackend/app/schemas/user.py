from datetime import date
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole
from pydantic import ConfigDict

class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone: str
    role: UserRole
    hire_date: date
    estado: Optional[str] = "activo"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    role: Optional[UserRole]
    hire_date: Optional[date]
    estado: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class User(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
