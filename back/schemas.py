from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal
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

# --- ESQUEMAS PARA TIPOS DE ASIGNACIÓN (CATÁLOGOS) ---
class TipoAsignacionCreate(BaseModel):
    nombre_tipo: str

class TipoAsignacionResponse(BaseModel):
    id_tipo_asignacion: int
    nombre_tipo: str

    model_config = ConfigDict(from_attributes=True)

class AsignacionUpdate(BaseModel):
    estado: str

class ProductoBase(BaseModel):
    codigo_sku: str
    nombre_producto: str

class ProductoCreate(ProductoBase):
    stock_actual: Decimal = Decimal('0.0')

class ProductoResponse(ProductoBase):
    id_producto: int
    stock_actual: Decimal

    model_config = ConfigDict(from_attributes=True)


# --- ESQUEMAS PARA TIPOS DE MERMA ---
class TipoMermaBase(BaseModel):
    descripcion_tipo: str

class TipoMermaCreate(TipoMermaBase):
    pass

class TipoMermaResponse(TipoMermaBase):
    id_tipo_merma: int

    model_config = ConfigDict(from_attributes=True)


# --- ESQUEMAS PARA REGISTRO DE MERMAS ---
class RegistroMermaCreate(BaseModel):
    id_producto: int
    id_tipo_merma: int
    cantidad: Decimal
    observacion: Optional[str] = None

class RegistroMermaResponse(BaseModel):
    id_merma: int
    id_producto: int
    id_tipo_merma: int
    id_usuario_admin: int
    cantidad: Decimal
    fecha_registro: datetime
    observacion: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)