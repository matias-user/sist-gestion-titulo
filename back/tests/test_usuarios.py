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