from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import ValidationError
from app.core.database import get_db
from app.schemas import ArrivalCreate, Arrival, TableSchema
from app.services import arrival_service, table_service
from app.websocket.manager import manager

router = APIRouter(prefix="/arrivals", tags=["arrivals"])

@router.post("/", response_model=Arrival)
async def add_arrival(data: ArrivalCreate, db: Session = Depends(get_db)):
    try:
        print(f"Received data: {data.dict()}")  # Debug log
        
        # Verificar si la mesa específica está disponible si se proporciona
        if hasattr(data, 'table_id') and data.table_id:
            table = table_service.get_table_by_id(db, data.table_id)
            if not table:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"field": "table_id", "message": "La mesa especificada no existe"}
                )
            if table.status != "free":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"field": "table_id", "message": "La mesa especificada no está disponible"}
                )
        
        arrival = arrival_service.create_arrival(db, data)
        if arrival:
            try:
                tables = table_service.get_all_tables(db)
                await manager.broadcast({
                    "event": "update_tables",
                    "tables": [TableSchema.from_orm(t).dict() for t in tables]
                })
            except Exception as websocket_error:
                print(f"WebSocket error (non-critical): {websocket_error}")
                # No fallar por errores de WebSocket
            
            return arrival
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"field": "general", "message": "No hay mesas disponibles en este momento"}
        )
        
    except ValidationError as e:
        print(f"Validation error: {e.errors()}")  # Debug log
        # Manejar errores de validación de Pydantic
        error_details = []
        for error in e.errors():
            field = error['loc'][-1] if error['loc'] else 'general'
            message = error['msg']
            error_details.append({"field": field, "message": message})
        
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=error_details
        )
    
    except HTTPException:
        # Re-raise HTTPExceptions as they are
        raise
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Debug log
        print(f"Error type: {type(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full traceback
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"field": "general", "message": f"Error interno del servidor: {str(e)}"}
        )

@router.get("/", response_model=list[Arrival])
def list_arrivals(db: Session = Depends(get_db)):
    return arrival_service.list_arrivals(db)
