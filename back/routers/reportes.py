from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
import io
import csv

from database import get_db
import models
import auth

router = APIRouter(
    prefix="/reportes",
    tags=["Módulo de Reportería Web y Descargas"]
)

# --- 1. REPORTE EN LÍNEA DE ASIGNACIONES (CON FILTROS Y NOMBRES REALES) ---
@router.get("/asignaciones")
def obtener_reporte_asignaciones(
    id_usuario: Optional[int] = Query(None),
    id_tipo_asignacion: Optional[int] = Query(None),
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(auth.get_current_user)
):
    query = db.query(
        models.AsignacionTrabajo.id_asignacion,
        models.AsignacionTrabajo.fecha_asignacion,
        models.AsignacionTrabajo.estado,
        models.AsignacionTrabajo.descripcion,
        models.Usuario.nombre_completo.label("nombre_trabajador"),
        models.TipoAsignacion.nombre_tipo.label("tipo_labor")
    ).join(models.Usuario, models.AsignacionTrabajo.id_usuario == models.Usuario.id_usuario)\
     .join(models.TipoAsignacion, models.AsignacionTrabajo.id_tipo_asignacion == models.TipoAsignacion.id_tipo_asignacion)

    # Restricción RBAC: Perfil básico (3) solo consulta su información
    if usuario_actual.id_rol == 3:
        query = query.filter(models.AsignacionTrabajo.id_usuario == usuario_actual.id_usuario)
    elif id_usuario:
        query = query.filter(models.AsignacionTrabajo.id_usuario == id_usuario)

    if id_tipo_asignacion:
        query = query.filter(models.AsignacionTrabajo.id_tipo_asignacion == id_tipo_asignacion)
    if fecha_inicio:
        query = query.filter(models.AsignacionTrabajo.fecha_asignacion >= fecha_inicio)
    if fecha_fin:
        query = query.filter(models.AsignacionTrabajo.fecha_asignacion <= fecha_fin)

    resultados = query.order_by(models.AsignacionTrabajo.fecha_asignacion.desc()).all()

    return [
        {
            "id_asignacion": r.id_asignacion,
            "fecha_asignacion": str(r.fecha_asignacion),
            "estado": r.estado,
            "descripcion": r.descripcion,
            "nombre_trabajador": r.nombre_trabajador,
            "tipo_labor": r.tipo_labor
        }
        for r in resultados
    ]


# --- 2. GENERACIÓN Y DESCARGA DE INFORME EN FORMATO CSV ---
@router.get("/asignaciones/csv")
def descargar_reporte_asignaciones_csv(
    id_usuario: Optional[int] = Query(None),
    id_tipo_asignacion: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(auth.get_current_user)
):
    query = db.query(
        models.AsignacionTrabajo.id_asignacion,
        models.AsignacionTrabajo.fecha_asignacion,
        models.AsignacionTrabajo.estado,
        models.AsignacionTrabajo.descripcion,
        models.Usuario.nombre_completo.label("nombre_trabajador"),
        models.TipoAsignacion.nombre_tipo.label("tipo_labor")
    ).join(models.Usuario, models.AsignacionTrabajo.id_usuario == models.Usuario.id_usuario)\
     .join(models.TipoAsignacion, models.AsignacionTrabajo.id_tipo_asignacion == models.TipoAsignacion.id_tipo_asignacion)

    if usuario_actual.id_rol == 3:
        query = query.filter(models.AsignacionTrabajo.id_usuario == usuario_actual.id_usuario)
    elif id_usuario:
        query = query.filter(models.AsignacionTrabajo.id_usuario == id_usuario)

    if id_tipo_asignacion:
        query = query.filter(models.AsignacionTrabajo.id_tipo_asignacion == id_tipo_asignacion)

    registros = query.all()

    # Creación del documento en memoria mediante io.StringIO
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    
    # Encabezados del Informe
    writer.writerow(["ID Asignacion", "Trabajador", "Tipo de Labor", "Fecha", "Estado", "Descripcion"])

    for r in registros:
        writer.writerow([
            r.id_asignacion,
            r.nombre_trabajador,
            r.tipo_labor,
            r.fecha_asignacion,
            r.estado,
            r.descripcion or ""
        ])

    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="informe_asignaciones_trabajo.csv"'
    }
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers=headers
    )