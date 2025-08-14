from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, validator
from typing import Optional
import re

class ArrivalBase(BaseModel):
    customer_name: str = Field(
        ..., 
        min_length=3, 
        max_length=40,
        description="Nombre del cliente (solo letras, 3-40 caracteres)"
    )
    party_size: int = Field(
        ..., 
        ge=1, 
        le=20,
        description="Número de comensales (1-20)"
    )
    contact: Optional[str] = Field(
        None, 
        max_length=50,
        description="Información de contacto (teléfono o email)"
    )
    preferences: Optional[str] = Field(
        None, 
        max_length=100,
        description="Preferencias de ubicación o especiales"
    )

    @validator('customer_name')
    def validate_customer_name(cls, v):
        if not v or not v.strip():
            raise ValueError('El nombre del cliente es requerido')
        
        # Solo letras, espacios y caracteres acentuados
        if not re.match(r'^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$', v.strip()):
            raise ValueError('El nombre solo puede contener letras y espacios')
        
        return v.strip()

    @validator('contact')
    def validate_contact(cls, v):
        if v is None or v == "":
            return None
        
        v = v.strip()
        if not v:
            return None
            
        # Validar formato de teléfono o email
        phone_pattern = r'^[0-9+() -]{7,20}$'
        email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        
        if not (re.match(phone_pattern, v) or re.match(email_pattern, v)):
            raise ValueError('El contacto debe ser un teléfono válido o un email válido')
        
        return v

    @validator('preferences')
    def validate_preferences(cls, v):
        if v is None or v == "":
            return None
        
        v = v.strip()
        if not v:
            return None
            
        return v

class ArrivalCreate(ArrivalBase): 
    table_id: Optional[int] = Field(
        None,
        description="ID de mesa específica (opcional para asignación automática)"
    )

class Arrival(ArrivalBase):
    id: int
    table_id: int
    assigned_at: datetime

    model_config = ConfigDict(from_attributes=True)
