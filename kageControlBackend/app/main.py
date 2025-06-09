from fastapi import FastAPI, WebSocket

from .database import Base, engine
from .routers import tables, arrivals, orders, kitchen, reports, auth, ingredients, menu
from .websocket import manager
from fastapi.middleware.cors import CORSMiddleware

# Crear las tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="KageControl API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # o ["*"] para todos (no recomendado en producción)
    allow_credentials=True,
    allow_methods=["*"],  # o especificar ["GET", "POST"]
    allow_headers=["*"],
)
# Rutas REST
app.include_router(tables.router)
app.include_router(arrivals.router)
app.include_router(orders.router)
app.include_router(kitchen.router)
app.include_router(reports.router)
app.include_router(auth.router)
app.include_router(ingredients.router)
app.include_router(menu.router)

# WebSocket para actualización en tiempo real del plano de mesas
@app.websocket("/ws/tables")
async def websocket_tables(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # cliente puede enviar un ping si se desea
    except:
        manager.disconnect(ws)
