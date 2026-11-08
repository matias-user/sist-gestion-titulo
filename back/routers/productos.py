from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth

router = APIRouter(
    prefix="/productos",
    tags=["Gestión de Productos e Inventario"]
)

# --- CREAR PRODUCTO (Solo Admins) ---
@router.post("/", response_model=schemas.ProductoResponse, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto: schemas.ProductoCreate,
    db: Session = Depends(get_db),
    admin_actual: models.Usuario = Depends(auth.requerir_roles([1, 2]))
):
    # Validar si el código SKU ya existe
    sku_existente = db.query(models.Producto).filter(models.Producto.codigo_sku == producto.codigo_sku).first()
    if sku_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El código SKU '{producto.codigo_sku}' ya está registrado."
        )

    nuevo_producto = models.Producto(**producto.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto


# --- LISTAR TODOS LOS PRODUCTOS ---
@router.get("/", response_model=list[schemas.ProductoResponse])
def obtener_productos(db: Session = Depends(get_db)):
    return db.query(models.Producto).all()


# --- OBTENER PRODUCTO POR ID ---
@router.get("/{id_producto}", response_model=schemas.ProductoResponse)
def obtener_producto_por_id(id_producto: int, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")
    return producto


# --- ACTUALIZAR STOCK O DATOS DEL PRODUCTO ---
@router.put("/{id_producto}", response_model=schemas.ProductoResponse)
def actualizar_producto(
    id_producto: int,
    producto_update: schemas.ProductoCreate,
    db: Session = Depends(get_db),
    admin_actual: models.Usuario = Depends(auth.requerir_roles([1, 2]))
):
    producto = db.query(models.Producto).filter(models.Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado.")

    producto.codigo_sku = producto_update.codigo_sku
    producto.nombre_producto = producto_update.nombre_producto
    producto.stock_actual = producto_update.stock_actual

    db.commit()
    db.refresh(producto)
    return producto