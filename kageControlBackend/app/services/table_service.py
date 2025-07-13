from sqlalchemy.orm import Session
from app.repository import table_repo
from app.models.table import TableStatus

def get_all_tables(db: Session):
    return table_repo.get_tables(db)

def create_table(db: Session, name: str, capacity: int):
    return table_repo.create_table(db, name, capacity)

def update_status(db: Session, table_id: int, status: TableStatus):
    return table_repo.update_table_status(db, table_id, status)

def get_table_by_id(db: Session, table_id: int):
    return table_repo.get_table_by_id(db, table_id)
