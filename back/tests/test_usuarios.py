# back/tests/test_usuarios.py
from fastapi.testclient import TestClient
from main import app

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