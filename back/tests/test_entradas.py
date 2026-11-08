from http import client

from fastapi.testclient import TestClient
from main import app
import models
from auth import get_current_user
from database import SessionLocal


client = TestClient(app)

def test_registrar_entrada_exitosamente():
    db = SessionLocal()

    usuario_prueba = None

    try:
        rut_prueba = "19281869-6"

        usuario_prueba = db.query(models.Usuario).filter(
            models.Usuario.rut == rut_prueba
        ).first()

        if usuario_prueba is None:

            area = db.query(models.Area).first()
            rol = db.query(models.Rol).filter(
                models.Rol.id_rol == 3
            ).first()

            assert area is not None, "No existe un área"
            assert rol is not None, "No existe el rol 3"

            usuario_prueba = models.Usuario(
                rut=rut_prueba,
                nombre_completo="Usuario Test Asistencia",
                password_hash="hash_falso",
                id_rol=rol.id_rol,
                id_area=area.id_area,
                estado_activo=True
            )

            db.add(usuario_prueba)
            db.commit()
            db.refresh(usuario_prueba)

        # Aquí puedes utilizar usuario_prueba.id_usuario
        print("Usuario:", usuario_prueba.id_usuario)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
def test_obtener_historial_entradas_propio():
    """
    Prueba que al consultar las entradas, el sistema responda correctamente (200 OK)
    devolviendo una lista (aunque esté vacía en la base de datos de pruebas).
    """
    def mock_get_current_user():
        return models.Usuario(id_usuario=10, rut="12345678-9", id_rol=3, estado_activo=True)

    app.dependency_overrides[get_current_user] = mock_get_current_user
    response = client.get("/entradas/")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert isinstance(response.json(), list)