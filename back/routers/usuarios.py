from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import utils
import auth

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


# --- 1. AUTENTICACIÓN (LOGIN) CON JWT ---
@router.post("/login")
def login_usuario(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Buscar al usuario por su RUT
    usuario = db.query(models.Usuario).filter(models.Usuario.rut == credenciales.rut).first()
    
    if not usuario or not utils.verify_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RUT o contraseña incorrectos"
        )
    
    # Crear token JWT con RUT e id_rol en el payload
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": usuario.rut, "id_rol": usuario.id_rol}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "rut": usuario.rut,
            "nombre_completo": usuario.nombre_completo,
            "id_rol": usuario.id_rol,
            "id_area": usuario.id_area
        }
    }


# --- 3. CREACIÓN Y REGISTRO DE USUARIOS (PROTEGIDO POR ROLES RBAC) ---
@router.post("/", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
@router.post("/registro", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    usuario: schemas.UsuarioCreate, 
    db: Session = Depends(get_db),
    admin_actual: models.Usuario = Depends(auth.requerir_roles([1, 2]))  # Protección RBAC: solo SuperAdmin (1) o Admin (2)
):
    # 1. Verificar si el RUT ya existe en la BBDD
    existe_usuario = db.query(models.Usuario).filter(models.Usuario.rut == usuario.rut).first()
    if existe_usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El RUT ingresado ya se encuentra registrado en el sistema."
        )

    # 2. Cifrar la contraseña con límite seguro de 72 bytes para bcrypt
    hashed_pwd = utils.get_password_hash(usuario.password[:72])
    
    # 3. Mapear e insertar el nuevo usuario
    usuario_datos = usuario.model_dump(exclude={"password"})
    usuario_datos["password_hash"] = hashed_pwd
    
    nuevo_usuario = models.Usuario(**usuario_datos)
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario


# --- 4. LISTADO GENERAL DE USUARIOS ---
@router.get("/", response_model=list[schemas.UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()