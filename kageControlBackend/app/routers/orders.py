from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio
from app.core.database import get_db
from app.schemas import Order, OrderCreate, OrderStatus
from app.services import order_service
from app.websocket.event_bus import event_bus

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=Order)
async def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    try:
        order = order_service.create_order(db, data)
        asyncio.create_task(event_bus.emit("order_created", {
            "order_id": order.id,
            "arrival_id": order.arrival_id
        }))
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tracking", response_model=list[dict])
def get_orders_for_tracking(db: Session = Depends(get_db)):
    orders = order_service.get_all_orders(db)
    return [
        {
            "id": o.id,
            "table": o.arrival.table.name if o.arrival and o.arrival.table else None,
            "items": [f"{od.quantity}x {od.dish.name}" for od in o.dishes],
            "status": o.status.value,
            "time": o.arrival.assigned_at.strftime("%H:%M") if o.arrival else "??:??",
        }
        for o in orders
    ]

@router.get("/dietary-notes", response_model=list[dict])
def get_dietary_notes(db: Session = Depends(get_db)):
    """Endpoint específico para obtener todas las órdenes con notas dietéticas"""
    orders = order_service.get_all_orders(db)
    
    dietary_notes = []
    for order in orders:
        # Solo incluir órdenes que tengan notas y que no estén servidas
        if order.notes and order.notes.strip() and order.status != OrderStatus.served:
            dietary_notes.append({
                "id": order.id,
                "table": order.arrival.table.name if order.arrival and order.arrival.table else f"Mesa {order.arrival_id}",
                "customer_name": order.arrival.customer_name if order.arrival else f"Mesa {order.arrival_id}",
                "notes": order.notes.strip(),
                "status": order.status.value,
                "arrival_id": order.arrival_id,
                "items": [f"{od.quantity}x {od.dish.name}" for od in order.dishes],
                "time": order.arrival.assigned_at.strftime("%H:%M") if order.arrival else "??:??"
            })
    
    return dietary_notes

@router.get("/{arrival_id}", response_model=list[Order])
def list_orders(arrival_id: int, db: Session = Depends(get_db)):
    return order_service.get_orders_by_arrival(db, arrival_id)

@router.get("/", response_model=list[Order])
def list_all_orders(db: Session = Depends(get_db)):
    return order_service.get_all_orders(db)

@router.patch("/{order_id}/status", response_model=Order)
async def change_order_status(order_id: int, status: OrderStatus, db: Session = Depends(get_db)):
    order = order_service.update_order_status(db, order_id, status)
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    asyncio.create_task(event_bus.emit("order_status_changed", {
        "order_id": order.id,
        "status": status.value
    }))
    return order
