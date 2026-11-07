from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth

router = APIRouter(
    prefix="/asignaciones",
    tags=["Asignaciones de Trabajo"]
)

# --- CREACIÓN PROTEGIDA POR RBAC ---
@router.post("/", response_model=schemas.AsignacionResponse, status_code=status.HTTP_201_CREATED)
def crear_asignacion(
    asignacion: schemas.AsignacionCreate,
    db: Session = Depends(get_db),
    admin_actual: models.Usuario = Depends(auth.requerir_roles([1, 2])) # Solo SuperAdmin(1) o Admin(2)
):
    # Validar que el usuario al que se le asigna la tarea exista
    usuario_destino = db.query(models.Usuario).filter(models.Usuario.id_usuario == asignacion.id_usuario).first()
    if not usuario_destino:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario asignado no existe en el sistema."
        )

    # Validar que el tipo de asignación exista
    tipo_existe = db.query(models.TipoAsignacion).filter(models.TipoAsignacion.id_tipo_asignacion == asignacion.id_tipo_asignacion).first()
    if not tipo_existe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El tipo de asignación no es válido."
        )

    nueva_asignacion = models.AsignacionTrabajo(**asignacion.model_dump())
    db.add(nueva_asignacion)
    db.commit()
    db.refresh(nueva_asignacion)
    
    return nueva_asignacion

# --- LECTURA INTELIGENTE SEGÚN ROL ---
@router.get("/", response_model=list[schemas.AsignacionResponse])
def obtener_asignaciones(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(auth.get_current_user)
):
    # Roles 1 y 2 ven todo el historial de la empresa
    if usuario_actual.id_rol in [1, 2]:
        return db.query(models.AsignacionTrabajo).order_by(models.AsignacionTrabajo.fecha_asignacion.desc()).all()
    
    # Rol 3 (Básico) ve exclusivamente sus propias tareas
    return db.query(models.AsignacionTrabajo)\
             .filter(models.AsignacionTrabajo.id_usuario == usuario_actual.id_usuario)\
             .order_by(models.AsignacionTrabajo.fecha_asignacion.desc()).all()


@router.patch("/{id_asignacion}", response_model=schemas.AsignacionResponse)
def actualizar_estado_asignacion(
    id_asignacion: int,
    estado_update: schemas.AsignacionUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(auth.get_current_user)
):
    asignacion = db.query(models.AsignacionTrabajo).filter(models.AsignacionTrabajo.id_asignacion == id_asignacion).first()
    
    if not asignacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asignación no encontrada.")
    
    # Seguridad: Si es rol 3 (Básico), verificar que la tarea le pertenezca
    if usuario_actual.id_rol == 3 and asignacion.id_usuario != usuario_actual.id_usuario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para modificar esta tarea.")

    asignacion.estado = estado_update.estado
    db.commit()
    db.refresh(asignacion)
    
    return asignacion