from sqlalchemy.orm import Session
from app.models.table import Table, TableStatus

def get_tables(db: Session):
    return db.query(Table).all()

def get_table_by_id(db: Session, table_id: int):
    return db.query(Table).filter(Table.id == table_id).first()

def get_table_by_name(db: Session, name: str):
    return db.query(Table).filter(Table.name == name).first()

def update_table_status(db: Session, table_id: int, status: TableStatus):
    table = db.query(Table).get(table_id)
    table.status = status
    db.commit()
    db.refresh(table)
    return table

def update_table(db: Session, table_id: int, capacity: int = None, status: TableStatus = None):
    table = db.query(Table).get(table_id)
    if table:
        if capacity is not None:
            table.capacity = capacity
        if status is not None:
            table.status = status
        db.commit()
        db.refresh(table)
    return table

def delete_table(db: Session, table_id: int):
    table = db.query(Table).get(table_id)
    if table:
        db.delete(table)
        db.commit()
        return True
    return False

def create_table(db: Session, name: str, capacity: int):
    new_table = Table(name=name, capacity=capacity)
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    return new_table
