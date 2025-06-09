from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from .. import database, models

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/attendance/pdf")
def attendance_report_pdf(
    start: datetime = Query(..., description="Fecha y hora inicio (RFC3339)"),
    end:   datetime = Query(..., description="Fecha y hora fin (RFC3339)"),
    db:    Session  = Depends(database.get_db)
):
    # 1) Obtén todas las llegadas en el rango
    arrivals = (
        db.query(models.Arrival, models.Table.name.label("table_name"))
        .join(models.Table, models.Arrival.table_id == models.Table.id)
        .filter(models.Arrival.assigned_at.between(start, end))
        .order_by(models.Arrival.assigned_at)
        .all()
    )
    total = len(arrivals)

    # 2) Prepara PDF
    buffer = BytesIO()
    styles = getSampleStyleSheet()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Título
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width/2, height - 50, "Informe de Atención por Mesa")

    # Fechas y resumen
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Desde: {start.strftime('%Y-%m-%d %H:%M')}")
    p.drawString(300, height - 80, f"Hasta: {end.strftime('%Y-%m-%d %H:%M')}")
    p.drawString(50, height - 100, f"Total de llegadas: {total}")

    # Espacio
    y = height - 130

    # Si no hay llegadas, mensaje
    if total == 0:
        p.drawString(50, y, "No se encontraron llegadas en ese período.")
    else:
        # Construye tabla de detalles
        data = [["Mesa", "Cliente", "Grupo", "Hora Asignada"]]
        for arr, table_name in arrivals:
            data.append([
                table_name,
                arr.customer_name,
                str(arr.party_size),
                arr.assigned_at.strftime("%Y-%m-%d %H:%M")
            ])
        # Crea Table de reportlab.platypus
        table = Table(data, colWidths=[80, 200, 60, 120])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#264653")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTNAME", (0,1), (-1,-1), "Helvetica"),
            ("FONTSIZE", (0,0), (-1,-1), 10),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ]))
        # Dibuja la tabla
        table.wrapOn(p, width, height)
        table.drawOn(p, 50, y - 20 - 15*len(data))

    p.showPage()
    p.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=attendance_report.pdf"}
    )
