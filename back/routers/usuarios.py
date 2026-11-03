from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import utils  # Importamos nuestras funciones de seguridad

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

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