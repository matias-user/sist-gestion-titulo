from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from routers import usuarios, catalogos, entradas    
import models
import schemas


models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Sistema de Gestión API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectamos el router de la entidad Usuarios
app.include_router(usuarios.router)
app.include_router(catalogos.router)
app.include_router(entradas.router)