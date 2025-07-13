from sqlalchemy.orm import Session
from app.models.table import Table, TableStatus

def get_tables(db: Session):
    return db.query(Table).all()

def get_table_by_id(db: Session, table_id: int):
    return db.query(Table).filter(Table.id == table_id).first()

def update_table_status(db: Session, table_id: int, status: TableStatus):
    table = db.query(Table).get(table_id)
    table.status = status
    db.commit()
    db.refresh(table)
    return table

def create_table(db: Session, name: str, capacity: int):
    new_table = Table(name=name, capacity=capacity)
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    return new_table
