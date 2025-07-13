from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import ArrivalCreate, Arrival, TableSchema
from app.services import arrival_service, table_service
from app.websocket.manager import manager

router = APIRouter(prefix="/arrivals", tags=["arrivals"])

@router.post("/", response_model=Arrival)
async def add_arrival(data: ArrivalCreate, db: Session = Depends(get_db)):
    arrival = arrival_service.create_arrival(db, data)
    if arrival:
        tables = table_service.get_all_tables(db)
        await manager.broadcast({
            "event": "update_tables",
            "tables": [TableSchema.from_orm(t).dict() for t in tables]
        })
        return arrival
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No hay mesas disponibles o la mesa está ocupada"
    )

@router.get("/", response_model=list[Arrival])
def list_arrivals(db: Session = Depends(get_db)):
    return arrival_service.list_arrivals(db)
