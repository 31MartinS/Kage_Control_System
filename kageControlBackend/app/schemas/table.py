from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.models.table import TableStatus

class TableBase(BaseModel):
    name: str
    capacity: int

class TableCreate(TableBase): pass

class TableUpdate(BaseModel):
    capacity: Optional[int] = None
    status: Optional[TableStatus] = None

    model_config = ConfigDict(from_attributes=True)

class TableResponse(BaseModel):
    id: int
    name: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class TableSchema(BaseModel):
    id: int
    name: str
    capacity: int
    status: str

    model_config = ConfigDict(from_attributes=True)
