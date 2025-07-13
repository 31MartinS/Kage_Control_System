from io import BytesIO
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from app.services import report_service

def generate_pdf_report(
    db: Session,
    start: str,
    end: str,
    sections: List[str]
):
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
        data = report_service.get_dashboard_data(db)["reservas"]
        elements.append(Paragraph("Reservas", styles['Heading2']))
        elements.append(Paragraph(f"Duración promedio: {data['duracion_promedio']} min", styles['Normal']))
        elements.append(Paragraph("Reservas por día:", styles['Normal']))
        for fecha, total in data["por_dia"].items():
            elements.append(Paragraph(f"{fecha}: {total} reservas", styles['Normal']))
        elements.append(Spacer(1, 12))

    if "ordenes" in sections:
        data = report_service.get_dashboard_data(db)["ordenes"]
        elements.append(Paragraph("Órdenes y Consumo", styles['Heading2']))
        elements.append(Paragraph("Top Platos:", styles['Normal']))
        for plato in data["top_platos"]:
            elementos = f"{plato['nombre']}: {plato['cantidad']} unidades"
            elements.append(Paragraph(elementos, styles['Normal']))
        elements.append(Spacer(1, 12))

    if "comensales" in sections:
        data = report_service.get_dashboard_data(db)["comensales"]
        elements.append(Paragraph("Comensales y Grupos", styles['Heading2']))
        elements.append(Paragraph(f"Tamaño promedio de grupo: {data['tamano_promedio']:.1f}", styles['Normal']))
        elements.append(Paragraph("Comensales por día:", styles['Normal']))
        for fecha, total in data["por_dia"].items():
            elements.append(Paragraph(f"{fecha}: {total} comensales", styles['Normal']))
        elements.append(Spacer(1, 12))

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=reporte_kagecontrol.pdf"}
    )
