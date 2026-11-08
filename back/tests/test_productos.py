import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from auth import get_current_user
import models

client = TestClient(app)

def test_crear_y_listar_producto():
    """
    Verifica que un Administrador pueda registrar un producto nuevo 
    y que este aparezca listado en el catálogo general.
    """
    db = SessionLocal()

    # 1. Obtenemos un usuario administrador existente
    admin_prueba = db.query(models.Usuario).filter(models.Usuario.id_rol.in_([1, 2])).first()
    if not admin_prueba:
        pytest.skip("Requiere al menos un administrador en la BBDD para ejecutar la prueba.")

    sku_test = "TEST-SKU-999"
    
    # Limpieza previa si existiera el registro de pruebas
    prod_existente = db.query(models.Producto).filter(models.Producto.codigo_sku == sku_test).first()
    if prod_existente:
        db.delete(prod_existente)
        db.commit()

    # 2. Inyectamos la sesión del administrador
    def mock_get_current_user():
        return admin_prueba

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 3. Realizamos el POST para crear el producto
    response_post = client.post("/productos/", json={
        "codigo_sku": sku_test,
        "nombre_producto": "Producto de Prueba Automática",
        "stock_actual": 50.0
    })

    assert response_post.status_code == 201
    datos_post = response_post.json()
    assert datos_post["codigo_sku"] == sku_test
    assert float(datos_post["stock_actual"]) == 50.0

    # 4. Probamos la restricción de unicidad para SKU duplicado
    response_duplicado = client.post("/productos/", json={
        "codigo_sku": sku_test,
        "nombre_producto": "Producto Duplicado",
        "stock_actual": 10.0
    })
    assert response_duplicado.status_code == 400
    assert "ya está registrado" in response_duplicado.json()["detail"]

    # 5. Verificamos la lectura pública del catálogo (GET /productos/)
    response_get = client.get("/productos/")
    assert response_get.status_code == 200
    assert isinstance(response_get.json(), list)
    assert any(p["codigo_sku"] == sku_test for p in response_get.json())

    app.dependency_overrides.clear()
    db.close()