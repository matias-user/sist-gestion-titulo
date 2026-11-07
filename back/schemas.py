from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
import schemas
from datetime import date

class UsuarioBase(BaseModel):
    rut: str
    nombre_completo: str
    id_rol: int
    id_area: int

class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=4, max_length=72)

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    estado_activo: bool

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(schemas.BaseModel):
    rut: str
    password: str


# --- ESQUEMAS PARA REGISTRO DE ENTRADAS ---
class RegistroEntradaCreate(BaseModel):
    # El usuario solo hace clic en un botón, no envía datos en el body.
    pass

class RegistroEntradaResponse(BaseModel):
    id_entrada: int
    fecha_hora: datetime
    id_usuario: int

    # Usar SOLO esta línea:
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS PARA ASIGNACIONES DE TRABAJO ---
class AsignacionBase(BaseModel):
    id_usuario: int
    id_tipo_asignacion: int
    descripcion: str
    fecha_asignacion: date

class AsignacionCreate(AsignacionBase):
    # Hereda los campos base, el estado "Pendiente" lo da por defecto la BBDD
    pass

class AsignacionResponse(AsignacionBase):
    id_asignacion: int
    estado: str

    model_config = ConfigDict(from_attributes=True)