from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth

router = APIRouter(
    prefix="/catalogos",
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

# --- NUEVOS ENDPOINTS PARA TIPOS DE ASIGNACIÓN ---
@router.post("/tipos-asignacion", response_model=schemas.TipoAsignacionResponse, status_code=status.HTTP_201_CREATED)
def crear_tipo_asignacion(
    tipo: schemas.TipoAsignacionCreate, 
    db: Session = Depends(get_db),
    admin_actual: models.Usuario = Depends(auth.requerir_roles([1, 2])) # Solo admins pueden crear categorías
):
    nuevo_tipo = models.TipoAsignacion(nombre_tipo=tipo.nombre_tipo)
    db.add(nuevo_tipo)
    db.commit()
    db.refresh(nuevo_tipo)
    return nuevo_tipo

@router.get("/tipos-asignacion", response_model=list[schemas.TipoAsignacionResponse])
def obtener_tipos_asignacion(db: Session = Depends(get_db)):
    return db.query(models.TipoAsignacion).all()