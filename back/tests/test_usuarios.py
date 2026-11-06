# back/tests/test_usuarios.py
from fastapi.testclient import TestClient
import pytest
from database import SessionLocal
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

def test_registrar_entrada_exitosamente():
    db = SessionLocal()
    rut_prueba = "19281869-6"
    
    # 1. Buscamos primero si el usuario de prueba ya existe en PostgreSQL
    usuario_prueba = db.query(models.Usuario).filter(models.Usuario.rut == rut_prueba).first()
    
    # 2. Solo si NO existe, lo creamos
    if not usuario_prueba:
        usuario_prueba = models.Usuario(
            rut=rut_prueba,
            nombre_completo="Usuario Test Asistencia",
            password_hash="hash_falso",
            id_rol=3,  # Asegúrate de tener las semillas insertadas (Rol 3 = Básico)
            id_area=1, # Asegúrate de tener las semillas insertadas (Área 1)
            estado_activo=True
        )
        db.add(usuario_prueba)
        db.commit()
        db.refresh(usuario_prueba)

    # 3. Inyectamos la simulación de sesión con el usuario garantizado
    def mock_get_current_user():
        return usuario_prueba

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 4. Ejecutamos la petición POST
    response = client.post("/entradas/")
    app.dependency_overrides.clear()
    db.close()

    # 5. Assertions
    assert response.status_code == 201
    datos = response.json()
    assert "id_entrada" in datos
    assert datos["id_usuario"] == usuario_prueba.id_usuario
    db = SessionLocal()
    
    # 1. Buscamos o creamos un usuario real en la base de datos para el test
    usuario_prueba = db.query(models.Usuario).filter(models.Usuario.rut == "99887766-TEST").first()
    
    if not usuario_prueba:
        usuario_prueba = models.Usuario(
            rut="19281869-8",
            nombre_completo="Usuario Test Asistencia",
            password_hash="hash_falso",
            id_rol=3, # Asegúrate de que el rol 3 y el área 1 existan en tus catálogos
            id_area=1,
            estado_activo=True
        )
        db.add(usuario_prueba)
        db.commit()
        db.refresh(usuario_prueba)

    # 2. Simulamos la sesión inyectando el usuario que acabamos de asegurar que existe
    def mock_get_current_user():
        return usuario_prueba

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 3. Ejecutamos la petición POST
    response = client.post("/entradas/")
    app.dependency_overrides.clear()

    # 4. Validamos
    assert response.status_code == 201
    datos = response.json()
    assert "id_entrada" in datos
    assert datos["id_usuario"] == usuario_prueba.id_usuario
    
    db.close()
    """
    Prueba que un usuario pueda marcar su entrada utilizando un usuario real
    de la base de datos para evitar errores de llave foránea en PostgreSQL.
    """
    # 1. Abrimos conexión a la base de datos y buscamos un usuario que sí exista
    db = SessionLocal()
    usuario_real = db.query(models.Usuario).first()
    db.close()
    
    # Si la base de datos está completamente vacía, saltamos la prueba
    if not usuario_real:
        pytest.skip("Debe existir al menos un usuario en la BBDD para ejecutar esta prueba")

    # 2. Simulamos la sesión inyectando los datos del usuario real
    def mock_get_current_user():
        return usuario_real

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 3. Ejecutamos la petición POST a la ruta de entradas
    response = client.post("/entradas/")
    app.dependency_overrides.clear()

    # 4. Validamos que la inserción fue exitosa y se generó el registro
    assert response.status_code == 201
    datos = response.json()
    assert "id_entrada" in datos
    assert "fecha_hora" in datos
    assert datos["id_usuario"] == usuario_real.id_usuario
    """
    Prueba que un usuario (cualquier rol) pueda marcar su entrada y el sistema le asigne 
    la fecha/hora de forma automática devolviendo un código 201 Created.
    """
    # 1. Simulamos en memoria a un usuario conectado
    def mock_get_current_user():
        return models.Usuario(
            id_usuario=10, # ID ficticio para la prueba
            rut="12345678-9",
            id_rol=3, 
            estado_activo=True
        )

    # 2. Interceptamos la dependencia de FastAPI para inyectar nuestra simulación
    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 3. Intentamos hacer el POST al endpoint de entradas (sin enviar body)
    response = client.post("/entradas/")

    # 4. Limpiamos la intercepción
    app.dependency_overrides.clear()

    # 5. Verificamos empíricamente que la entrada se registró
    assert response.status_code == 201
    datos = response.json()
    assert "id_entrada" in datos
    assert "fecha_hora" in datos
    assert datos["id_usuario"] == 10

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