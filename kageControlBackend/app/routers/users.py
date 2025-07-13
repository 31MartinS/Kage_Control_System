from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import user_service
from app.schemas import User, UserUpdate
from typing import List

router = APIRouter(prefix="/auth/users", tags=["users"])

@router.get("/", response_model=List[User])
def list_users(db: Session = Depends(get_db)):
    return user_service.list_users(db)

@router.get("/{user_id}", response_model=User)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.patch("/{user_id}", response_model=User)
def update_user_route(user_id: int, updates: UserUpdate, db: Session = Depends(get_db)):
    user = user_service.update_user(db, user_id, updates.dict(exclude_unset=True))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.delete("/{user_id}", status_code=200)
def delete_user_route(user_id: int, db: Session = Depends(get_db)):
    success = user_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": f"Usuario con ID {user_id} eliminado correctamente"}
