from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, database
from ..websocket import manager

router = APIRouter(prefix="/arrivals", tags=["arrivals"])

@router.post("/", response_model=schemas.Arrival)
async def add_arrival(data: schemas.ArrivalCreate, db: Session = Depends(database.get_db)):
    arrival = crud.create_arrival(db, data)
    if arrival:
        tables = crud.get_tables(db)
        await manager.broadcast({
            "event": "update_tables",
            "tables": [t.__dict__ for t in tables]
        })
        return arrival
    return {"error": "No hay mesas disponibles"}
