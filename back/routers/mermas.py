from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
import models
import schemas
import auth

router = APIRouter(
    prefix="/mermas",
    tags=["Gestión de Mermas de Inventario"]
)

# --- CREAR REGISTRO DE MERMA (Protegido Admin/SuperAdmin) ---
@router.post("/", response_model=schemas.RegistroMermaResponse, status_code=status.HTTP_201_CREATED)
def registrar_merma(
    merma: schemas.RegistroMermaCreate,
    db: Session = Depends(get_db),
    admin_actual: models.Usuario = Depends(auth.requerir_roles([1, 2]))
):
    # 1. Validar existencia del producto
    producto = db.query(models.Producto).filter(models.Producto.id_producto == merma.id_producto).first()
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El producto especificado no existe."
        )

    # 2. Validar que la cantidad mermada no supere el stock disponible
    if merma.cantidad > producto.stock_actual:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La cantidad mermada ({merma.cantidad}) excede el stock actual disponible ({producto.stock_actual})."
        )

    # 3. Validar existencia del tipo de merma
    tipo_merma = db.query(models.TipoMerma).filter(models.TipoMerma.id_tipo_merma == merma.id_tipo_merma).first()
    if not tipo_merma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El tipo de merma especificado no existe."
        )

    # 4. Registrar la merma
    nueva_merma = models.RegistroMerma(
        id_producto=merma.id_producto,
        id_tipo_merma=merma.id_tipo_merma,
        id_usuario_admin=admin_actual.id_usuario,
        cantidad=merma.cantidad,
        observacion=merma.observacion,
        fecha_registro=datetime.now()
    )
    db.add(nueva_merma)

    # 5. Descuento automático de stock
    producto.stock_actual -= merma.cantidad

    db.commit()
    db.refresh(nueva_merma)

    return nueva_merma


# --- CONSULTAR HISTORIAL DE MERMAS ---
@router.get("/", response_model=list[schemas.RegistroMermaResponse])
def obtener_mermas(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(auth.get_current_user)
):
    return db.query(models.RegistroMerma).order_by(models.RegistroMerma.fecha_registro.desc()).all()


# --- ENDPOINTS DE APOYO (PRODUCTOS Y CATÁLOGOS) ---
@router.get("/productos", response_model=list[schemas.ProductoResponse])
def obtener_productos(db: Session = Depends(get_db)):
    return db.query(models.Producto).all()

@router.post("/productos", response_model=schemas.ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto: schemas.ProductoCreate,
    db: Session = Depends(get_db),
    admin_actual: models.Usuario = Depends(auth.requerir_roles([1, 2]))
):
    nuevo = models.Producto(**producto.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo