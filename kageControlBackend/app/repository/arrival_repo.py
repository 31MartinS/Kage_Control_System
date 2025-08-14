from sqlalchemy.orm import Session
from datetime import datetime
from app.models.arrival import Arrival
from app.models.table import TableStatus
from app.schemas.arrival import ArrivalCreate
from app.models import Table

def create_arrival(db: Session, data: ArrivalCreate):
    # Si se especifica una mesa específica, usarla
    if hasattr(data, 'table_id') and data.table_id:
        table = db.query(Table).filter(Table.id == data.table_id, Table.status == TableStatus.free).first()
        if not table:
            return None
    else:
        # Buscar una mesa libre automáticamente
        table = db.query(Table).filter(Table.status == TableStatus.free).first()
        if not table:
            return None
    
    # Cambiar el estado de la mesa a ocupada
    table.status = TableStatus.occupied
    
    # Crear la llegada con los datos del formulario
    arrival_data = data.dict(exclude={'table_id'})  # Excluir table_id de los datos
    arrival = Arrival(
        **arrival_data,
        table_id=table.id,
        assigned_at=datetime.utcnow()
    )
    
    db.add(arrival)
    db.commit()
    db.refresh(arrival)
    return arrival

def get_all_arrivals(db: Session):
    return db.query(Arrival).all()
