from fastapi import APIRouter, Depends, HTTPException
from ..models import Table
from sqlalchemy.orm import Session
from fastapi import status

from ..schemas import TableCreate, TableResponse, TableUpdate, TableSchema

from .. import crud, database
from ..websocket import manager

router = APIRouter(prefix="/tables", tags=["tables"])

@router.get("/")
def get_all(db: Session = Depends(database.get_db)):
    return crud.get_tables(db)

@router.post("/refresh")
async def refresh(db: Session = Depends(database.get_db)):
    tables = crud.get_tables(db)
    await manager.broadcast({
        "event": "update_tables",
        "tables": [TableSchema.from_orm(t).dict() for t in tables]
    })
    return {"message": "Actualización enviada por WebSocket"}

@router.put("/{table_id}")
async def update_table(table_id: int, table_update: TableUpdate, db: Session = Depends(database.get_db)):
    # 1. Buscar mesa
    mesa = db.query(Table).filter(Table.id == table_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    # 2. Actualizar campos
    mesa.status = table_update.status
    db.commit()
    db.refresh(mesa)

    # 3. Obtener todas las mesas y emitir por WebSocket
    mesas = crud.get_tables(db)
    tables_serialized = [TableSchema.from_orm(t).dict() for t in mesas]
    await manager.broadcast({
        "event": "update_tables",
        "tables": tables_serialized
    })

    return {"message": "Mesa actualizada", "mesa": TableSchema.from_orm(mesa).dict()}

@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(table: TableCreate, db: Session = Depends(database.get_db)):
    existing = db.query(Table).filter_by(name=table.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="La mesa ya existe")

    new_table = Table(name=table.name, capacity=table.capacity)
    db.add(new_table)
    db.commit()
    db.refresh(new_table)

    tables = db.query(Table).all()
    response_data = [
        {
            "id": t.id,
            "name": t.name,
            "capacity": t.capacity,
            "status": t.status.value,
        }
        for t in tables
    ]

    # ✅ Aquí sí puedes usar await
    await manager.broadcast({
        "event": "update_tables",
        "tables": response_data
    })

    return new_table
