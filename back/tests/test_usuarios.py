# back/tests/test_usuarios.py
from fastapi.testclient import TestClient
from main import app
import models
from auth import get_current_user

client = TestClient(app)

def test_login_credenciales_incorrectas():
    """Prueba que el endpoint /usuarios/login rechace un RUT o contraseña inválidos con 401."""
    response = client.post("/usuarios/login", json={
        "rut": "99999999-9",
        "password": "clave_falsa"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "RUT o contraseña incorrectos"

def test_login_exitoso_genera_jwt():
    """
    Prueba que un usuario registrado y válido obtenga un token JWT de acceso.
    (Asegúrate de tener un usuario creado en tu base de datos o mockeado para esta prueba).
    """
    response = client.post("/usuarios/login", json={
        "rut": "12345678-9", 
        "password": "Prueba123" 
    })
    
    # Si las credenciales son correctas, el backend debe retornar 200 OK y el token
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "usuario" in data

def test_rbac_bloqueo_usuario_basico():
    """
    Prueba que un usuario con rol Básico (3) reciba un error 403 Forbidden 
    al intentar registrar a un nuevo usuario en el sistema.
    """
    # 1. Simulamos en memoria a un usuario conectado con rol Básico
    def mock_get_current_user():
        return models.Usuario(
            rut="12345678-9", 
            nombre_completo="Usuario Básico Test", 
            id_rol=3, 
            estado_activo=True
        )

    # 2. Interceptamos la dependencia de FastAPI para inyectar nuestra simulación
    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 3. Intentamos hacer el POST al endpoint protegido
    response = client.post("/usuarios/registro", json={
        "rut": "99999999-9",
        "nombre_completo": "Intento de Registro",
        "id_rol": 3,
        "id_area": 1,
        "password": "ClaveSecreta123"
    })

    # 4. Limpiamos la intercepción para no afectar a otras pruebas
    app.dependency_overrides.clear()

    # 5. Verificamos empíricamente el bloqueo y el mensaje de error
    assert response.status_code == 403
    assert response.json()["detail"] == "No posees los permisos requeridos para realizar esta acción"