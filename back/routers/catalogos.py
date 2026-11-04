from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(
    tags=["Catálogos y Maestros"]
)

@router.get("/roles")
def obtener_roles(db: Session = Depends(get_db)):
    """Retorna la lista de roles registrados."""
    return db.query(models.Rol).all()

@router.get("/areas")
def obtener_areas(db: Session = Depends(get_db)):
    """Retorna la lista de áreas organizacionales."""
    return db.query(models.Area).all()