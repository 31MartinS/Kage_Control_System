from io import BytesIO
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, Image, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.charts.legends import Legend
from reportlab.graphics import renderPDF
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from app.services import report_service

class KageReportGenerator:
    def __init__(self):
        # Colores del tema KageControl
        self.colors = {
            'primary': colors.Color(59/255, 174/255, 160/255),      # #3BAEA0
            'secondary': colors.Color(231/255, 111/255, 81/255),     # #E76F51
            'accent': colors.Color(244/255, 162/255, 97/255),        # #F4A261
            'dark': colors.Color(38/255, 70/255, 83/255),            # #264653
            'light': colors.Color(248/255, 250/255, 252/255),        # #F8FAFC
            'success': colors.Color(16/255, 185/255, 129/255),       # #10B981
            'white': colors.white,
            'black': colors.black,
            'gray': colors.Color(107/255, 114/255, 128/255)
        }
        
        self.styles = self._create_styles()
    
    def _create_styles(self):
        """Crear estilos personalizados para el reporte"""
        styles = getSampleStyleSheet()
        
        # Estilo del título principal
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Title'],
            fontSize=28,
            textColor=self.colors['dark'],
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Estilo del subtítulo
        styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=styles['Normal'],
            fontSize=14,
            textColor=self.colors['gray'],
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))
        
        # Estilo para encabezados de sección
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=self.colors['primary'],
            spaceBefore=20,
            spaceAfter=12,
            fontName='Helvetica-Bold',
            borderWidth=0,
            borderColor=self.colors['primary'],
            borderPadding=10
        ))
        
        # Estilo para métricas destacadas
        styles.add(ParagraphStyle(
            name='MetricValue',
            parent=styles['Normal'],
            fontSize=24,
            textColor=self.colors['secondary'],
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            spaceAfter=5
        ))
        
        # Estilo para etiquetas de métricas
        styles.add(ParagraphStyle(
            name='MetricLabel',
            parent=styles['Normal'],
            fontSize=12,
            textColor=self.colors['gray'],
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))
        
        # Estilo para texto normal mejorado
        styles.add(ParagraphStyle(
            name='CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            textColor=self.colors['dark'],
            fontName='Helvetica',
            leading=14
        ))
        
        return styles
    
    def _create_header(self, elements):
        """Crear encabezado del reporte"""
        # Logo placeholder (se puede reemplazar con logo real)
        logo_table = Table([
            ['🍽️', 'KAGE CONTROL SYSTEM'],
            ['', 'Sistema de Gestión Restaurante']
        ], colWidths=[1*inch, 4*inch])
        
        logo_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (0, 0), 24),
            ('FONTSIZE', (1, 0), (1, 0), 20),
            ('FONTSIZE', (1, 1), (1, 1), 12),
            ('FONTNAME', (1, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, 1), 'Helvetica'),
            ('TEXTCOLOR', (1, 0), (1, 0), self.colors['dark']),
            ('TEXTCOLOR', (1, 1), (1, 1), self.colors['gray']),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(logo_table)
        elements.append(Spacer(1, 20))
        
        # Línea decorativa
        line_table = Table([['']], colWidths=[7*inch])
        line_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 3, self.colors['primary']),
        ]))
        elements.append(line_table)
        elements.append(Spacer(1, 20))
    
    def _create_summary_metrics(self, elements, data):
        """Crear sección de métricas resumen"""
        elements.append(Paragraph("📊 RESUMEN EJECUTIVO", self.styles['SectionHeader']))
        elements.append(Spacer(1, 10))
        
        # Calcular métricas
        total_reservas = sum(data['reservas']['por_dia'].values()) if data['reservas']['por_dia'] else 0
        total_comensales = sum(data['comensales']['por_dia'].values()) if data['comensales']['por_dia'] else 0
        promedio_grupo = data['comensales']['tamano_promedio']
        top_platos_count = len(data['ordenes']['top_platos']) if data['ordenes']['top_platos'] else 0
        
        # Crear tabla de métricas
        metrics_data = [
            ['RESERVAS TOTALES', 'COMENSALES TOTALES', 'PROMEDIO GRUPO', 'PLATOS DIFERENTES'],
            [str(total_reservas), str(total_comensales), f"{promedio_grupo:.1f}", str(top_platos_count)]
        ]
        
        metrics_table = Table(metrics_data, colWidths=[1.75*inch]*4)
        metrics_table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Values
            ('BACKGROUND', (0, 1), (-1, 1), self.colors['light']),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 18),
            ('TEXTCOLOR', (0, 1), (-1, 1), self.colors['secondary']),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 1, self.colors['gray']),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [self.colors['primary'], self.colors['light']]),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        elements.append(metrics_table)
        elements.append(Spacer(1, 30))
    
    def _create_reservas_section(self, elements, data):
        """Crear sección de análisis de reservas"""
        reservas_data = data['reservas']
        
        elements.append(Paragraph("📅 ANÁLISIS DE RESERVAS", self.styles['SectionHeader']))
        elements.append(Spacer(1, 10))
        
        # Texto descriptivo
        total_reservas = sum(reservas_data['por_dia'].values()) if reservas_data['por_dia'] else 0
        elementos_texto = [
            f"Durante el período analizado se registraron un total de <b>{total_reservas} reservas</b>.",
            f"La duración promedio de las reservas fue de <b>{reservas_data['duracion_promedio']} minutos</b>."
        ]
        
        for texto in elementos_texto:
            elements.append(Paragraph(texto, self.styles['CustomNormal']))
            elements.append(Spacer(1, 6))
        
        elements.append(Spacer(1, 15))
        
        # Tabla de reservas por día
        if reservas_data['por_dia']:
            elements.append(Paragraph("Distribución Diaria de Reservas:", self.styles['CustomNormal']))
            elements.append(Spacer(1, 10))
            
            # Preparar datos para la tabla
            tabla_datos = [['Fecha', 'Cantidad de Reservas', 'Porcentaje del Total']]
            for fecha, cantidad in sorted(reservas_data['por_dia'].items()):
                porcentaje = (cantidad / total_reservas * 100) if total_reservas > 0 else 0
                fecha_formateada = datetime.fromisoformat(fecha).strftime('%d/%m/%Y')
                tabla_datos.append([fecha_formateada, str(cantidad), f"{porcentaje:.1f}%"])
            
            tabla_reservas = Table(tabla_datos, colWidths=[2*inch, 2*inch, 2*inch])
            tabla_reservas.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, self.colors['gray']),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.colors['light']]),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            elements.append(tabla_reservas)
            elements.append(Spacer(1, 20))
        
        # Estado de las mesas
        elements.append(Paragraph("Estado Actual de las Mesas:", self.styles['CustomNormal']))
        elements.append(Spacer(1, 10))
        
        estados = reservas_data['por_estado']
        estado_nombres = {
            'free': 'Libres',
            'occupied': 'Ocupadas', 
            'reserved': 'Reservadas',
            'cleaning': 'En Limpieza'
        }
        
        estado_datos = [['Estado', 'Cantidad', 'Porcentaje']]
        total_mesas = sum(estados.values()) if estados else 0
        
        for estado, cantidad in estados.items():
            porcentaje = (cantidad / total_mesas * 100) if total_mesas > 0 else 0
            estado_datos.append([estado_nombres.get(estado, estado), str(cantidad), f"{porcentaje:.1f}%"])
        
        tabla_estados = Table(estado_datos, colWidths=[2*inch, 2*inch, 2*inch])
        tabla_estados.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['accent']),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, self.colors['gray']),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.colors['light']]),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        elements.append(tabla_estados)
        elements.append(Spacer(1, 30))
    
    def _create_ordenes_section(self, elements, data):
        """Crear sección de análisis de órdenes"""
        ordenes_data = data['ordenes']
        
        elements.append(Paragraph("🍽️ ANÁLISIS DE ÓRDENES Y MENÚ", self.styles['SectionHeader']))
        elements.append(Spacer(1, 10))
        
        top_platos = ordenes_data['top_platos'][:10]  # Top 10
        
        if top_platos:
            total_unidades = sum(plato['cantidad'] for plato in top_platos)
            
            elements.append(Paragraph(
                f"Se han identificado los <b>{len(top_platos)} platos más populares</b> con un total de "
                f"<b>{total_unidades} unidades vendidas</b> en el período analizado.",
                self.styles['CustomNormal']
            ))
            elements.append(Spacer(1, 15))
            
            # Tabla de top platos
            elements.append(Paragraph("Ranking de Platos Más Populares:", self.styles['CustomNormal']))
            elements.append(Spacer(1, 10))
            
            tabla_datos = [['Posición', 'Plato', 'Unidades Vendidas', '% del Total']]
            
            for idx, plato in enumerate(top_platos, 1):
                porcentaje = (plato['cantidad'] / total_unidades * 100) if total_unidades > 0 else 0
                # Agregar emoji según la posición
                emoji = "🥇" if idx == 1 else "🥈" if idx == 2 else "🥉" if idx == 3 else f"{idx}°"
                tabla_datos.append([
                    emoji,
                    plato['nombre'],
                    str(plato['cantidad']),
                    f"{porcentaje:.1f}%"
                ])
            
            tabla_platos = Table(tabla_datos, colWidths=[0.8*inch, 3*inch, 1.5*inch, 1.2*inch])
            tabla_platos.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['secondary']),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (0, -1), 'CENTER'),  # Posición centrada
                ('ALIGN', (1, 0), (1, -1), 'LEFT'),    # Nombre izquierda
                ('ALIGN', (2, 0), (-1, -1), 'CENTER'), # Números centrados
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, self.colors['gray']),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.colors['light']]),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                # Destacar top 3
                ('BACKGROUND', (0, 1), (-1, 3), self.colors['accent']),
                ('TEXTCOLOR', (0, 1), (-1, 3), colors.white),
                ('FONTNAME', (0, 1), (-1, 3), 'Helvetica-Bold'),
            ]))
            
            elements.append(tabla_platos)
            elements.append(Spacer(1, 20))
            
            # Análisis adicional
            if len(top_platos) >= 3:
                top_3_total = sum(plato['cantidad'] for plato in top_platos[:3])
                top_3_porcentaje = (top_3_total / total_unidades * 100) if total_unidades > 0 else 0
                
                elements.append(Paragraph(
                    f"<b>Análisis:</b> Los 3 platos más populares representan el <b>{top_3_porcentaje:.1f}%</b> "
                    f"del total de ventas, lo que indica {'una alta concentración' if top_3_porcentaje > 50 else 'una distribución equilibrada'} "
                    f"en las preferencias de los comensales.",
                    self.styles['CustomNormal']
                ))
                elements.append(Spacer(1, 30))
    
    def _create_comensales_section(self, elements, data):
        """Crear sección de análisis de comensales"""
        comensales_data = data['comensales']
        
        elements.append(Paragraph("👥 ANÁLISIS DE COMENSALES", self.styles['SectionHeader']))
        elements.append(Spacer(1, 10))
        
        total_comensales = sum(comensales_data['por_dia'].values()) if comensales_data['por_dia'] else 0
        promedio_grupo = comensales_data['tamano_promedio']
        dias_activos = len(comensales_data['por_dia']) if comensales_data['por_dia'] else 0
        promedio_diario = total_comensales / dias_activos if dias_activos > 0 else 0
        
        elementos_texto = [
            f"Durante el período se atendieron <b>{total_comensales} comensales</b> en total.",
            f"El tamaño promedio de grupo fue de <b>{promedio_grupo:.1f} personas</b>.",
            f"Se registró un promedio de <b>{promedio_diario:.1f} comensales por día</b>."
        ]
        
        for texto in elementos_texto:
            elements.append(Paragraph(texto, self.styles['CustomNormal']))
            elements.append(Spacer(1, 6))
        
        elements.append(Spacer(1, 15))
        
        # Tabla de comensales por día
        if comensales_data['por_dia']:
            elements.append(Paragraph("Distribución Diaria de Comensales:", self.styles['CustomNormal']))
            elements.append(Spacer(1, 10))
            
            tabla_datos = [['Fecha', 'Comensales', 'Diferencia vs Promedio']]
            for fecha, cantidad in sorted(comensales_data['por_dia'].items()):
                diferencia = cantidad - promedio_diario
                diferencia_texto = f"+{diferencia:.0f}" if diferencia > 0 else f"{diferencia:.0f}"
                fecha_formateada = datetime.fromisoformat(fecha).strftime('%d/%m/%Y')
                tabla_datos.append([fecha_formateada, str(cantidad), diferencia_texto])
            
            tabla_comensales = Table(tabla_datos, colWidths=[2*inch, 2*inch, 2*inch])
            tabla_comensales.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['dark']),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, self.colors['gray']),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.colors['light']]),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            elements.append(tabla_comensales)
            elements.append(Spacer(1, 30))
    
    def _create_footer(self, elements):
        """Crear pie de página"""
        elements.append(Spacer(1, 30))
        
        # Línea decorativa
        line_table = Table([['']], colWidths=[7*inch])
        line_table.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, -1), 2, self.colors['primary']),
        ]))
        elements.append(line_table)
        elements.append(Spacer(1, 10))
        
        # Información del pie
        footer_data = [
            [f"Reporte generado el {datetime.now().strftime('%d/%m/%Y a las %H:%M')}"],
            ["KageControl System - Sistema de Gestión para Restaurantes"],
            ["📧 contacto@kagecontrol.com | 🌐 www.kagecontrol.com"]
        ]
        
        footer_table = Table(footer_data, colWidths=[7*inch])
        footer_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (0, 0), 10),
            ('FONTSIZE', (0, 1), (0, 1), 12),
            ('FONTSIZE', (0, 2), (0, 2), 9),
            ('FONTNAME', (0, 1), (0, 1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, 0), self.colors['gray']),
            ('TEXTCOLOR', (0, 1), (0, 1), self.colors['dark']),
            ('TEXTCOLOR', (0, 2), (0, 2), self.colors['gray']),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        elements.append(footer_table)

def generate_pdf_report(
    db: Session,
    start: str,
    end: str,
    sections: List[str]
):
    """Generar reporte PDF mejorado"""
    start_date = datetime.fromisoformat(start.replace("T", " ").split("+")[0])
    end_date = datetime.fromisoformat(end.replace("T", " ").split("+")[0])
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    generator = KageReportGenerator()
    elements = []
    
    # Crear encabezado
    generator._create_header(elements)
    
    # Título y fecha del reporte
    elements.append(Paragraph("REPORTE DE ANÁLISIS", generator.styles['CustomTitle']))
    elements.append(Paragraph(
        f"Período: {start_date.strftime('%d/%m/%Y')} - {end_date.strftime('%d/%m/%Y')}",
        generator.styles['CustomSubtitle']
    ))
    
    # Obtener datos
    data = report_service.get_dashboard_data(db)
    
    # Crear sección de resumen
    generator._create_summary_metrics(elements, data)
    
    # Crear secciones según selección
    if "reservas" in sections:
        generator._create_reservas_section(elements, data)
    
    if "ordenes" in sections:
        generator._create_ordenes_section(elements, data)
    
    if "comensales" in sections:
        generator._create_comensales_section(elements, data)
    
    # Crear pie de página
    generator._create_footer(elements)
    
    # Construir documento
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        BytesIO(buffer.read()),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=reporte_kagecontrol_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.pdf"
        }
    )
