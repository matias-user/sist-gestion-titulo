from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import utils  # Importamos nuestras funciones de seguridad

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

@router.post("/login")
def login_usuario(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    # 1. Buscar al usuario por su RUT en la base de datos
    usuario = db.query(models.Usuario).filter(models.Usuario.rut == credenciales.rut).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RUT o contraseña incorrectos"
        )
    
    # 2. Verificar la contraseña en texto plano contra el hash guardado en PostgreSQL
    password_valido = utils.verify_password(credenciales.password, usuario.password_hash)
    
    if not password_valido:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="RUT o contraseña incorrectos"
        )
    
    # 3. Retornar una respuesta exitosa (puedes emitir un Token JWT más adelante)
    return {
        "mensaje": "¡Inicio de sesión exitoso!",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "rut": usuario.rut,
            "nombre_completo": usuario.nombre_completo,
            "id_rol": usuario.id_rol,
            "id_area": usuario.id_area
        }
    }

@router.post("/", response_model=schemas.UsuarioResponse)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # Imprime en la consola de tu terminal lo que está llegando realmente
    print("--- DEBUG PASSWORD ---")
    print("Valor recibido:", repr(usuario.password))
    print("Largo:", len(usuario.password))
    print("----------------------")
    
    hashed_pwd = utils.get_password_hash(usuario.password)
    
    usuario_datos = usuario.model_dump(exclude={"password"})
    usuario_datos["password_hash"] = hashed_pwd
    
    nuevo_usuario = models.Usuario(**usuario_datos)
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario

@router.get("/", response_model=list[schemas.UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()