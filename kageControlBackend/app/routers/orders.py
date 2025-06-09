from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models import OrderStatus
from .. import crud, schemas, database

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.Order)
def create_order(data: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    try:
        return crud.create_order(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tracking", response_model=list[dict])
def get_orders_for_tracking(db: Session = Depends(database.get_db)):
    orders = crud.get_all_orders(db)
    result = []
    for order in orders:
        items = []
        for od in order.dishes:
            items.append(f"{od.quantity}x {od.dish.name}")
        result.append({
            "id": order.id,
            "table": order.arrival.table.name if order.arrival and order.arrival.table else None,
            "items": items,
            "status": list(OrderStatus).index(order.status),
            "time": order.arrival.assigned_at.strftime("%H:%M") if order.arrival else "??:??",
        })
    return result

@router.get("/{arrival_id}", response_model=list[schemas.Order])
def list_orders(arrival_id: int, db: Session = Depends(database.get_db)):
    return crud.get_orders_by_arrival(db, arrival_id)
@router.get("/", response_model=list[schemas.Order])
def list_all_orders(db: Session = Depends(database.get_db)):
    return crud.get_all_orders(db)
@router.patch("/{order_id}/status", response_model=schemas.Order)
def change_order_status(order_id: int, status: OrderStatus, db: Session = Depends(database.get_db)):
    order = crud.update_order_status(db, order_id, status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order



