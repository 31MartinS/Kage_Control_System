from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.repository import user_repo

def register_user(db: Session, user: UserCreate):
    if user_repo.get_user_by_username(db, user.username):
        raise ValueError("Usuario ya existe")
    return user_repo.create_user(db, user)

def login_user(db: Session, username: str, password: str, verify_fn):
    user = user_repo.get_user_by_username(db, username)
    if not user or not verify_fn(password, user.hashed_password) or user.estado != "activo":
        return None
    return user

def list_users(db: Session):
    return user_repo.get_all_users(db)

def get_user(db: Session, user_id: int):
    return user_repo.get_user_by_id(db, user_id)

def update_user(db: Session, user_id: int, updates: dict):
    return user_repo.update_user(db, user_id, updates)

def delete_user(db: Session, user_id: int):
    return user_repo.delete_user(db, user_id)
