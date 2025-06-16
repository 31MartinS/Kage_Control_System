from io import BytesIO
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from collections import defaultdict
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from .. import database, models

router = APIRouter(prefix="/reports", tags=["reports"])

def calculate_duration(start: datetime, end: datetime) -> int:
    """Calcula la duración en minutos entre dos fechas."""
    return int((end - start).total_seconds() / 60)
@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(database.get_db)):
    # === RESERVAS ===
    all_arrivals = db.query(models.Arrival).all()

    reservas_por_dia = defaultdict(int)
    estados = {"free": 0, "reserved": 0, "occupied": 0, "cleaning": 0}

    for a in all_arrivals:
        fecha = a.assigned_at.date().isoformat()
        reservas_por_dia[fecha] += 1
        estados[a.table.status.value] += 1

    # === ÓRDENES Y CONSUMO ===
    orders = db.query(models.Order).all()
    platos_count = defaultdict(int)

    for o in orders:
        for d in o.dishes:
            platos_count[d.dish.name] += d.quantity

    top_platos = [
        {"nombre": k, "cantidad": v}
        for k, v in sorted(platos_count.items(), key=lambda x: x[1], reverse=True)[:10]
    ]

    # === COMENSALES ===
    total_por_fecha = defaultdict(int)
    tamanio_grupo = []

    for a in all_arrivals:
        fecha = a.assigned_at.date().isoformat()
        total_por_fecha[fecha] += a.party_size
        tamanio_grupo.append(a.party_size)

    tamano_promedio = sum(tamanio_grupo) / len(tamanio_grupo) if tamanio_grupo else 0

    return {
        "reservas": {
            "duracion_promedio": 0,  # Valor predeterminado, ya que no hay 'left_at'
            "por_dia": dict(reservas_por_dia),
            "por_estado": estados
        },
        "ordenes": {
            "top_platos": top_platos
        },
        "comensales": {
            "tamano_promedio": tamano_promedio,
            "por_dia": dict(total_por_fecha)
        }
    }


@router.get("/reservations")
def get_reservations_report(
    db: Session = Depends(database.get_db),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """Informe detallado de reservas con filtrado por fechas."""
    query = db.query(models.Arrival)
    if start_date:
        query = query.filter(models.Arrival.assigned_at >= start_date)
    if end_date:
        query = query.filter(models.Arrival.assigned_at <= end_date)
    arrivals = query.all()

    reservas_por_dia = defaultdict(int)
    estados = {"free": 0, "reserved": 0, "occupied": 0, "cleaning": 0}
    horas_pico = defaultdict(int)

    for a in arrivals:
        fecha = a.assigned_at.date().isoformat()
        reservas_por_dia[fecha] += 1
        hora = a.assigned_at.hour
        horas_pico[hora] += 1
        estados[a.table.status.value] += 1

    duracion_promedio = 0  # No hay 'left_at'

    return {
        "reservas_por_dia": dict(reservas_por_dia),
        "estados_mesas": estados,
        "horas_pico": dict(horas_pico),
        "duracion_promedio_min": duracion_promedio
    }

@router.get("/orders-consumption")
def get_orders_consumption_report(
    db: Session = Depends(database.get_db),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """Informe de órdenes y consumo con análisis de platillos."""
    query = db.query(models.Order)
    orders = query.all()  # No filtramos por fechas porque no hay 'created_at'

    platos_count = defaultdict(int)
    ingresos_por_plato = defaultdict(float)
    franja_horas = defaultdict(int)
    ingresos_totales = 0

    for o in orders:
        # No podemos usar hora porque no hay 'created_at'
        for d in o.dishes:
            platos_count[d.dish.name] += d.quantity
            if hasattr(d.dish, "price") and d.dish.price:
                ingresos_por_plato[d.dish.name] += d.quantity * d.dish.price

    top_platos = [
        {"nombre": k, "cantidad": v, "ingresos": ingresos_por_plato[k]}
        for k, v in sorted(platos_count.items(), key=lambda x: x[1], reverse=True)[:10]
    ]

    return {
        "top_platos": top_platos,
        "consumo_por_hora": dict(franja_horas),  # Vacío porque no hay 'created_at'
        "ingresos_totales": ingresos_totales
    }

@router.get("/diners-groups")
def get_diners_groups_report(
    db: Session = Depends(database.get_db),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """Informe de comensales y grupos con métricas detalladas."""
    query = db.query(models.Arrival)
    if start_date:
        query = query.filter(models.Arrival.assigned_at >= start_date)
    if end_date:
        query = query.filter(models.Arrival.assigned_at <= end_date)
    arrivals = query.all()

    total_por_fecha = defaultdict(int)
    tamanio_grupo = []
    no_shows = 0

    for a in arrivals:
        fecha = a.assigned_at.date().isoformat()
        total_por_fecha[fecha] += a.party_size
        tamanio_grupo.append(a.party_size)

    tamano_promedio = sum(tamanio_grupo) / len(tamanio_grupo) if tamanio_grupo else 0

    return {
        "comensales_por_dia": dict(total_por_fecha),
        "tamano_promedio_grupo": tamano_promedio,
        "no_shows": no_shows
    }

@router.get("/financial")
def get_financial_report(
    db: Session = Depends(database.get_db),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """Informe financiero (placeholder para datos reales)."""
    query = db.query(models.Order)
    orders = query.all()  # No filtramos por fechas porque no hay 'created_at'

    ingresos = sum(o.total for o in orders if hasattr(o, "total") and o.total) or 0
    costos = 0
    margen = ingresos - costos if costos else ingresos

    return {
        "ingresos": ingresos,
        "costos": costos,
        "margen": margen
    }

@router.get("/pdf")
def get_pdf_report(
    start: str = Query(...),
    end: str = Query(...),
    sections: List[str] = Query(...),
    db: Session = Depends(database.get_db)
):
    """Genera un informe en PDF basado en las secciones seleccionadas."""
    start_date = datetime.fromisoformat(start.replace("T", " ").split("+")[0])
    end_date = datetime.fromisoformat(end.replace("T", " ").split("+")[0])

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Informe de KageControl", styles['Title']))
    elements.append(Paragraph(f"Desde: {start_date} Hasta: {end_date}", styles['Normal']))
    elements.append(Spacer(1, 12))

    if "reservas" in sections:
        data = get_reservations_report(db, start_date, end_date)
        elements.append(Paragraph("Reservas", styles['Heading2']))
        elements.append(Paragraph(f"Duración promedio: {data['duracion_promedio_min']} min", styles['Normal']))
        elements.append(Paragraph("Reservas por día:", styles['Normal']))
        for fecha, total in data['reservas_por_dia'].items():
            elements.append(Paragraph(f"{fecha}: {total} reservas", styles['Normal']))
        elements.append(Spacer(1, 12))

    if "ordenes" in sections:
        data = get_orders_consumption_report(db, start_date, end_date)
        elements.append(Paragraph("Órdenes y Consumo", styles['Heading2']))
        elements.append(Paragraph("Nota: No se filtraron por fechas debido a datos limitados", styles['Normal']))
        elements.append(Paragraph("Top Platos:", styles['Normal']))
        for plato in data['top_platos']:
            elements.append(Paragraph(f"{plato['nombre']}: {plato['cantidad']} unidades, ${plato['ingresos']:.2f}", styles['Normal']))
        elements.append(Spacer(1, 12))

    if "comensales" in sections:
        data = get_diners_groups_report(db, start_date, end_date)
        elements.append(Paragraph("Comensales y Grupos", styles['Heading2']))
        elements.append(Paragraph(f"Tamaño promedio de grupo: {data['tamano_promedio_grupo']:.1f}", styles['Normal']))
        elements.append(Paragraph("Comensales por día:", styles['Normal']))
        for fecha, total in data['comensales_por_dia'].items():
            elements.append(Paragraph(f"{fecha}: {total} comensales", styles['Normal']))
        elements.append(Spacer(1, 12))

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_kagecontrol.pdf"}
    )