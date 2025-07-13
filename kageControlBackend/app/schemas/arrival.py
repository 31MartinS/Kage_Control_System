from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

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
