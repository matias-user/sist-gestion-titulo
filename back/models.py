from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Area(Base):
    __tablename__ = "areas"
    id_area = Column(Integer, primary_key=True, index=True)
    nombre_area = Column(String(50), nullable=False)

class Rol(Base):
    __tablename__ = "roles"
    id_rol = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), nullable=False)

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    rut = Column(String(12), unique=True, nullable=False)
    nombre_completo = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    estado_activo = Column(Boolean, default=True)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"))
    id_area = Column(Integer, ForeignKey("areas.id_area"))

class RegistroEntrada(Base):
    __tablename__ = "registros_entradas"
    id_entrada = Column(Integer, primary_key=True, index=True)
    fecha_hora = Column(TIMESTAMP, nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))

class TipoAsignacion(Base):
    __tablename__ = "tipos_asignacion"
    id_tipo_asignacion = Column(Integer, primary_key=True, index=True)
    nombre_tipo = Column(String(100), nullable=False)

class AsignacionTrabajo(Base):
    __tablename__ = "asignaciones_trabajo"
    id_asignacion = Column(Integer, primary_key=True, index=True)
    descripcion = Column(Text)
    fecha_asignacion = Column(Date, nullable=False)
    estado = Column(String(20), default="Pendiente")
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_tipo_asignacion = Column(Integer, ForeignKey("tipos_asignacion.id_tipo_asignacion"))

class Producto(Base):
    __tablename__ = "productos"
    id_producto = Column(Integer, primary_key=True, index=True)
    codigo_sku = Column(String(50), unique=True, nullable=False)
    nombre_producto = Column(String(150), nullable=False)
    stock_actual = Column(Numeric(10, 2), default=0)

class TipoMerma(Base):
    __tablename__ = "tipos_merma"
    id_tipo_merma = Column(Integer, primary_key=True, index=True)
    descripcion_tipo = Column(String(100), nullable=False)

class RegistroMerma(Base):
    __tablename__ = "registros_mermas"
    id_merma = Column(Integer, primary_key=True, index=True)
    cantidad = Column(Numeric(10, 2), nullable=False)
    fecha_registro = Column(TIMESTAMP, nullable=False)
    observacion = Column(Text)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"))
    id_tipo_merma = Column(Integer, ForeignKey("tipos_merma.id_tipo_merma"))
    id_usuario_admin = Column(Integer, ForeignKey("usuarios.id_usuario"))
