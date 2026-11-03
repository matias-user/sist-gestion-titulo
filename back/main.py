from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from routers import usuarios
import models
import schemas

app = FastAPI()

# Conectamos el router de la entidad Usuarios
app.include_router(usuarios.router)

@app.get("/healthcheck")
def db_healthcheck(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "conectada"}