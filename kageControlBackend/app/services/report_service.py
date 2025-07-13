from sqlalchemy.orm import Session
from collections import defaultdict
from app.models import Arrival, Order
from statistics import mean

def get_dashboard_data(db: Session):
    all_arrivals = db.query(Arrival).all()
    reservas_por_dia = defaultdict(int)
    estados = {"free": 0, "reserved": 0, "occupied": 0, "cleaning": 0}
    for a in all_arrivals:
        fecha = a.assigned_at.date().isoformat()
        reservas_por_dia[fecha] += 1
        estados[a.table.status.value] += 1

    orders = db.query(Order).all()
    platos_count = defaultdict(int)
    for o in orders:
        for d in o.dishes:
            platos_count[d.dish.name] += d.quantity

    top_platos = sorted(platos_count.items(), key=lambda x: x[1], reverse=True)[:10]
    total_por_fecha = defaultdict(int)
    tamanio_grupo = [a.party_size for a in all_arrivals]
    for a in all_arrivals:
        total_por_fecha[a.assigned_at.date().isoformat()] += a.party_size

    return {
        "reservas": {
            "duracion_promedio": 0,
            "por_dia": dict(reservas_por_dia),
            "por_estado": estados
        },
        "ordenes": {
            "top_platos": [{"nombre": k, "cantidad": v} for k, v in top_platos]
        },
        "comensales": {
            "tamano_promedio": mean(tamanio_grupo) if tamanio_grupo else 0,
            "por_dia": dict(total_por_fecha)
        }
    }
