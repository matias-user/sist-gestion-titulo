from fastapi import FastAPI
from sqlalchemy import create_engine

# Inicialización de FastAPI
app = FastAPI(title="Sistema de Gestión API")

# URL de conexión a tu base de datos local
# Formato: postgresql://usuario:contraseña@servidor:puerto/nombre_bd
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:TU_CONTRASEÑA@localhost:5432/sistema_gestion"

# Motor de conexión de SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)

@app.get("/")
def read_root():
    return {"status": "ok", "mensaje": "Backend FastAPI en línea y conectado"}