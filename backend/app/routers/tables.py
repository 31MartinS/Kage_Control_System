from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
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
        "tables": [t.__dict__ for t in tables]
    })
