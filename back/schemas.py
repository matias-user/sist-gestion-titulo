from pydantic import BaseModel, Field

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

    class Config:
        from_attributes = True