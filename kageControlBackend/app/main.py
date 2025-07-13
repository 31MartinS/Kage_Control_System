from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routers import (
    auth,
    users,
    tables,
    arrivals,
    orders,
    kitchen,
    ingredients,
    menu,
    reports
)
from app.websocket import endpoints as websocket_endpoints
from app.websocket.event_listeners import register_listeners

# Crear las tablas de la base de datos si no existen
Base.metadata.create_all(bind=engine)

# Instancia de FastAPI
app = FastAPI(title="KageControl API")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Cambia según tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers REST
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tables.router)
app.include_router(arrivals.router)
app.include_router(orders.router)
app.include_router(kitchen.router)
app.include_router(ingredients.router)
app.include_router(menu.router)
app.include_router(reports.router)

# WebSocket endpoints
app.include_router(websocket_endpoints.router)

# Registro de listeners de eventos
register_listeners()
