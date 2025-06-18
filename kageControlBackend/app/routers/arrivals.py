from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import crud, schemas, database
from ..websocket import manager
from app.schemas import TableSchema

router = APIRouter(prefix="/arrivals", tags=["arrivals"])


@router.post("/", response_model=schemas.Arrival)
async def add_arrival(data: schemas.ArrivalCreate, db: Session = Depends(database.get_db)):
    arrival = crud.create_arrival(db, data)
    if arrival:
        # ✅ Obtener mesas actualizadas
        tables = crud.get_tables(db)

        # ✅ Enviar actualización a través del WebSocket
        await manager.broadcast({
            "event": "update_tables",
            "tables": [TableSchema.from_orm(t).dict() for t in tables]
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
