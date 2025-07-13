from .event_bus import event_bus
from .manager import manager

async def on_order_created(data: dict):
    print(f"🆕 Nueva orden creada (ID: {data['order_id']}) para llegada {data['arrival_id']}.")
    await manager.broadcast({
        "event": "order_created",
        "order_id": data["order_id"],
        "arrival_id": data["arrival_id"],
    })

async def on_order_status_changed(data: dict):
    print(f"🔁 Orden {data['order_id']} cambió al estado '{data['status']}'.")
    await manager.broadcast({
        "event": "order_status_changed",
        "order_id": data["order_id"],
        "status": data["status"],
    })

def register_listeners():
    event_bus.subscribe("order_created", on_order_created)
    event_bus.subscribe("order_status_changed", on_order_status_changed)
