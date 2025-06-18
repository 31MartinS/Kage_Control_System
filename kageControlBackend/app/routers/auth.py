from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from .. import schemas, crud, database, models
from ..auth import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    return crud.create_user(db, user)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_username(db, form_data.username)

    if (
        not user
        or not verify_password(form_data.password, user.hashed_password)
        or user.estado != "activo"
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos o cuenta inactiva",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({
        "sub": user.username,
        "role": user.role.value
    })
    return {"access_token": access_token}


@router.get("/users", response_model=List[schemas.User])
def list_users(db: Session = Depends(database.get_db)):
    users = crud.get_all_users(db)
    return users
@router.get("/users/{user_id}", response_model=schemas.User)
def get_user_by_id(user_id: int, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.patch("/users/{user_id}", response_model=schemas.User)
def update_user_route(user_id: int, updates: schemas.UserUpdate, db: Session = Depends(database.get_db)):
    user = crud.update_user(db, user_id, updates.dict(exclude_unset=True))
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.delete("/users/{user_id}", status_code=200)
def delete_user_route(user_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return { "message": f"Usuario con ID {user_id} eliminado correctamente" }

