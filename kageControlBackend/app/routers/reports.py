from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.services import report_service
from app.utils.pdf_generator import generate_pdf_report
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    return report_service.get_dashboard_data(db)

@router.get("/pdf")
def get_pdf_report(
    start: str = Query(...),
    end: str = Query(...),
    sections: List[str] = Query(...),
    db: Session = Depends(get_db)
) -> StreamingResponse:
    return generate_pdf_report(db, start, end, sections)
