from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import database, models
from collections import defaultdict
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard")
def admin_dashboard_data(db: Session = Depends(database.get_db)):
    # === RESERVAS ===
    all_arrivals = db.query(models.Arrival).all()

    reservas_por_dia = defaultdict(int)
    estados = {"free": 0, "reserved": 0, "occupied": 0, "cleaning": 0}
    horas_pico = defaultdict(int)
    duraciones = []

    for a in all_arrivals:
        fecha = a.assigned_at.date().isoformat()
        reservas_por_dia[fecha] += 1
        hora = a.assigned_at.hour
        horas_pico[hora] += 1
        estados[a.table.status.value] += 1

    # Simulación de duración
    for i in range(len(all_arrivals) - 1):
        duraciones.append(30 + (i % 60))  # valores ficticios

    # === MESEROS ===
    users = db.query(models.User).filter(models.User.role == "mesero").all()
    meseros = []
    for u in users:
        meseros.append({
            "nombre": u.full_name,
            "ordenes": len(all_arrivals) // max(len(users), 1),
            "tiempo": 15 + len(u.username),  # Simulado
            "ventas": 20 * len(u.username)  # Simulado
        })

    # === PLATOS Y ÓRDENES ===
    orders = db.query(models.Order).all()
    platos_count = defaultdict(int)
    franja_horas = defaultdict(int)

    for o in orders:
        hora = o.arrival.assigned_at.hour
        franja_horas[hora] += 1
        for d in o.dishes:
            platos_count[d.dish.name] += d.quantity

    platos_ordenados = sorted(platos_count.items(), key=lambda x: x[1], reverse=True)
    top_platos = [{"nombre": k, "cantidad": v} for k, v in platos_ordenados[:10]]

    # === COMENSALES ===
    total_por_fecha = defaultdict(int)
    tamanio_grupo = []

    for a in all_arrivals:
        fecha = a.assigned_at.date().isoformat()
        total_por_fecha[fecha] += a.party_size
        tamanio_grupo.append(a.party_size)

    return {
        "reservas": {
            "por_dia": reservas_por_dia,
            "por_estado": estados,
            "horas_pico": horas_pico,
            "duracion_promedio": sum(duraciones) / len(duraciones) if duraciones else 0
        },
        "meseros": meseros,
        "ordenes": {
            "top_platos": top_platos,
            "por_hora": franja_horas
        },
        "comensales": {
            "por_dia": total_por_fecha,
            "tamano_promedio": sum(tamanio_grupo) / len(tamanio_grupo) if tamanio_grupo else 0,
            "no_shows": 0,  # opcional si implementas
        }
    }
