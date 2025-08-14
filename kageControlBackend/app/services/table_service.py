from sqlalchemy.orm import Session
from app.repository import table_repo
from app.models.table import TableStatus

def get_all_tables(db: Session):
    return table_repo.get_tables(db)

def create_table(db: Session, name: str, capacity: int):
    return table_repo.create_table(db, name, capacity)

def update_status(db: Session, table_id: int, status: TableStatus):
    return table_repo.update_table_status(db, table_id, status)

def update_table(db: Session, table_id: int, capacity: int = None, status: TableStatus = None):
    return table_repo.update_table(db, table_id, capacity, status)

def get_table_by_id(db: Session, table_id: int):
    return table_repo.get_table_by_id(db, table_id)

def get_table_by_name(db: Session, name: str):
    return table_repo.get_table_by_name(db, name)

def delete_table(db: Session, table_id: int):
    return table_repo.delete_table(db, table_id)
