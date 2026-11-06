from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
import models
import schemas
import auth

router = APIRouter(
    prefix="/entradas",
    tags=["Control de Entradas"]
)

@router.post("/", response_model=schemas.RegistroEntradaResponse, status_code=status.HTTP_201_CREATED)
def registrar_entrada(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(auth.get_current_user)
):
    # Generamos el registro utilizando el ID del token y la fecha/hora exacta del servidor
    nueva_entrada = models.RegistroEntrada(
        id_usuario=usuario_actual.id_usuario,
        fecha_hora=datetime.now()
    )
    
    db.add(nueva_entrada)
    db.commit()
    db.refresh(nueva_entrada)
    
    return nueva_entrada

@router.get("/", response_model=list[schemas.RegistroEntradaResponse])
def obtener_entradas(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(auth.get_current_user)
):
    # Control de acceso inteligente: 
    # Roles 1 y 2 (Super Admin y Admin) ven el registro global
    if usuario_actual.id_rol in [1, 2]:
        return db.query(models.RegistroEntrada).order_by(models.RegistroEntrada.fecha_hora.desc()).all()
    
    # Rol 3 (Básico) solo ve su propio historial
    return db.query(models.RegistroEntrada)\
             .filter(models.RegistroEntrada.id_usuario == usuario_actual.id_usuario)\
             .order_by(models.RegistroEntrada.fecha_hora.desc()).all()