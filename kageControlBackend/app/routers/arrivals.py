from fastapi import APIRouter, Depends, HTTPException, status
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

    # ⚠️ Lanzar error si no hay mesas
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No hay mesas disponibles o la mesa está ocupada"
    )

@router.get("/", response_model=list[schemas.Arrival])
def list_arrivals(db: Session = Depends(database.get_db)):
    return crud.get_all_arrivals(db)  # Asegúrate de tener este método en `crud.py`
