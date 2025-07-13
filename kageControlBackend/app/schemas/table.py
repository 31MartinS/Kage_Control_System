from pydantic import BaseModel, ConfigDict
from app.models.table import TableStatus

class TableBase(BaseModel):
    name: str
    capacity: int

class TableCreate(TableBase): pass

class TableUpdate(BaseModel):
    status: TableStatus

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
