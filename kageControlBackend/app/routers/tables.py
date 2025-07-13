from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import TableCreate, TableUpdate, TableSchema, TableResponse
from app.services import table_service
from app.websocket.manager import manager

router = APIRouter(prefix="/tables", tags=["tables"])

@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return table_service.get_all_tables(db)

@router.post("/refresh")
async def refresh(db: Session = Depends(get_db)):
    tables = table_service.get_all_tables(db)
    await manager.broadcast({
        "event": "update_tables",
        "tables": [TableSchema.from_orm(t).dict() for t in tables]
    })
    return {"message": "Actualización enviada por WebSocket"}

@router.put("/{table_id}")
async def update_table(table_id: int, table_update: TableUpdate, db: Session = Depends(get_db)):
    mesa = table_service.get_table_by_id(db, table_id)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    mesa = table_service.update_status(db, table_id, table_update.status)
    mesas = table_service.get_all_tables(db)
    await manager.broadcast({
        "event": "update_tables",
        "tables": [TableSchema.from_orm(t).dict() for t in mesas]
    })
    return {"message": "Mesa actualizada", "mesa": TableSchema.from_orm(mesa).dict()}

@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(table: TableCreate, db: Session = Depends(get_db)):
    existing = db.query(table_service.get_all_tables(db)[0].__class__).filter_by(name=table.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="La mesa ya existe")
    new_table = table_service.create_table(db, table.name, table.capacity)
    tables = table_service.get_all_tables(db)
    await manager.broadcast({
        "event": "update_tables",
        "tables": [
            {
                "id": t.id,
                "name": t.name,
                "capacity": t.capacity,
                "status": t.status.value,
            }
            for t in tables
        ]
    })
    return new_table
