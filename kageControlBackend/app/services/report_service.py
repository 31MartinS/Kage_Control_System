from sqlalchemy.orm import Session
from collections import defaultdict
from app.models import Arrival, Order, Table
from statistics import mean
from datetime import datetime, timedelta
from sqlalchemy import func

def get_dashboard_data(db: Session):
    """Obtener datos completos del dashboard con análisis mejorado"""
    
    # Obtener todas las llegadas
    all_arrivals = db.query(Arrival).all()
    reservas_por_dia = defaultdict(int)
    
    # Obtener estado actual de las mesas
    tables = db.query(Table).all()
    estados = {"free": 0, "reserved": 0, "occupied": 0, "cleaning": 0}
    for table in tables:
        if hasattr(table.status, 'value'):
            estados[table.status.value] += 1
        else:
            estados[str(table.status)] += 1
    
    # Procesar reservas por día
    for arrival in all_arrivals:
        if arrival.assigned_at:
            fecha = arrival.assigned_at.date().isoformat()
            reservas_por_dia[fecha] += 1

    # Obtener órdenes y análisis de platos
    orders = db.query(Order).all()
    platos_count = defaultdict(int)
    total_revenue = 0
    
    for order in orders:
        for dish_order in order.dishes:
            platos_count[dish_order.dish.name] += dish_order.quantity
            # Si hay precio, calcularlo (asumiendo que existe un campo price)
            # total_revenue += dish_order.quantity * getattr(dish_order.dish, 'price', 0)

    # Top 15 platos más populares
    top_platos = sorted(platos_count.items(), key=lambda x: x[1], reverse=True)[:15]
    
    # Análisis de comensales
    total_por_fecha = defaultdict(int)
    tamanio_grupos = [arrival.party_size for arrival in all_arrivals if arrival.party_size]
    
    for arrival in all_arrivals:
        if arrival.assigned_at and arrival.party_size:
            fecha = arrival.assigned_at.date().isoformat()
            total_por_fecha[fecha] += arrival.party_size

    # Calcular métricas adicionales
    promedio_grupo = mean(tamanio_grupos) if tamanio_grupos else 0
    total_comensales = sum(total_por_fecha.values())
    total_reservas = sum(reservas_por_dia.values())
    
    # Análisis de tendencias (últimos 7 días vs anteriores 7 días)
    today = datetime.now().date()
    last_week = today - timedelta(days=7)
    prev_week = today - timedelta(days=14)
    
    reservas_ultima_semana = sum(1 for a in all_arrivals 
                                if a.assigned_at and a.assigned_at.date() >= last_week)
    reservas_semana_anterior = sum(1 for a in all_arrivals 
                                  if a.assigned_at and prev_week <= a.assigned_at.date() < last_week)
    
    # Calcular duración promedio de reservas (simulado - se podría mejorar con datos reales)
    duracion_promedio = 90  # minutos, valor por defecto
    
    return {
        "reservas": {
            "duracion_promedio": duracion_promedio,
            "por_dia": dict(reservas_por_dia),
            "por_estado": estados,
            "total": total_reservas,
            "tendencia": {
                "ultima_semana": reservas_ultima_semana,
                "semana_anterior": reservas_semana_anterior,
                "cambio_porcentual": ((reservas_ultima_semana - reservas_semana_anterior) / 
                                    reservas_semana_anterior * 100) if reservas_semana_anterior > 0 else 0
            }
        },
        "ordenes": {
            "top_platos": [{"nombre": k, "cantidad": v} for k, v in top_platos],
            "total_platos_diferentes": len(platos_count),
            "total_unidades_vendidas": sum(platos_count.values()),
            # "revenue_total": total_revenue
        },
        "comensales": {
            "tamano_promedio": promedio_grupo,
            "por_dia": dict(total_por_fecha),
            "total": total_comensales,
            "grupos_totales": len(tamanio_grupos),
            "distribucion_grupos": _get_group_size_distribution(tamanio_grupos)
        },
        "metricas_generales": {
            "periodo_analisis": {
                "inicio": min(reservas_por_dia.keys()) if reservas_por_dia else None,
                "fin": max(reservas_por_dia.keys()) if reservas_por_dia else None,
                "dias_activos": len(reservas_por_dia)
            },
            "promedios": {
                "reservas_por_dia": total_reservas / len(reservas_por_dia) if reservas_por_dia else 0,
                "comensales_por_dia": total_comensales / len(total_por_fecha) if total_por_fecha else 0,
                "comensales_por_reserva": total_comensales / total_reservas if total_reservas > 0 else 0
            }
        }
    }

def _get_group_size_distribution(group_sizes):
    """Obtener distribución del tamaño de grupos"""
    if not group_sizes:
        return {}
    
    distribution = defaultdict(int)
    for size in group_sizes:
        if size <= 2:
            distribution["1-2 personas"] += 1
        elif size <= 4:
            distribution["3-4 personas"] += 1
        elif size <= 6:
            distribution["5-6 personas"] += 1
        else:
            distribution["7+ personas"] += 1
    
    return dict(distribution)
