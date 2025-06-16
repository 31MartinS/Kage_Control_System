# app/routers/orders.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio

from ..models import OrderStatus
from .. import crud, schemas, database
from ..notificaciones.event_bus import event_bus

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.Order)
async def create_order(
    data: schemas.OrderCreate,
    db: Session = Depends(database.get_db)
):
    """
    Crea la orden y lanza el evento en el mismo loop con create_task.
    """
    try:
        order = crud.create_order(db, data)
        # Scheduleamos la emisión del evento en background dentro del loop
        asyncio.create_task(
            event_bus.emit(
                "order_created",
                {"order_id": order.id, "arrival_id": order.arrival_id}
            )
        )
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tracking", response_model=list[dict])
def get_orders_for_tracking(db: Session = Depends(database.get_db)):
    orders = crud.get_all_orders(db)
    return [
        {
            "id": o.id,
            "table": o.arrival.table.name if o.arrival and o.arrival.table else None,
            "items": [f"{od.quantity}x {od.dish.name}" for od in o.dishes],
            "status": list(OrderStatus).index(o.status),
            "time": o.arrival.assigned_at.strftime("%H:%M") if o.arrival else "??:??",
        }
        for o in orders
    ]


@router.get("/{arrival_id}", response_model=list[schemas.Order])
def list_orders(arrival_id: int, db: Session = Depends(database.get_db)):
    return crud.get_orders_by_arrival(db, arrival_id)


@router.get("/", response_model=list[schemas.Order])
def list_all_orders(db: Session = Depends(database.get_db)):
    return crud.get_all_orders(db)


@router.patch("/{order_id}/status", response_model=schemas.Order)
async def change_order_status(
    order_id: int,
    status: OrderStatus,
    db: Session = Depends(database.get_db)
):
    """
    Actualiza estado y schedulea el evento.
    """
    order = crud.update_order_status(db, order_id, status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    asyncio.create_task(
        event_bus.emit(
            "order_status_changed",
            {"order_id": order.id, "status": status.value}
        )
    )
    return order
