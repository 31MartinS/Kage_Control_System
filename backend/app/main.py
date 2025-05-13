from fastapi import FastAPI, WebSocket
from .database import Base, engine
from .routers import tables, arrivals, orders, kitchen, reports, auth
from .websocket import manager

# Crear las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="KageControl API")

# Rutas REST
app.include_router(tables.router)
app.include_router(arrivals.router)
app.include_router(orders.router)
app.include_router(kitchen.router)
app.include_router(reports.router)
app.include_router(auth.router)

# WebSocket para actualización en tiempo real del plano de mesas
@app.websocket("/ws/tables")
async def websocket_tables(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # cliente puede enviar un ping si se desea
    except:
        manager.disconnect(ws)
