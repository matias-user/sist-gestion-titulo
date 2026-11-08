import pytest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from auth import get_current_user
import models

client = TestClient(app)

def test_registrar_merma_y_descontar_stock():
    """
    Prueba que un Administrador pueda registrar una merma y que el 
    sistema descuente automáticamente el stock del producto afectado.
    """
    db = SessionLocal()
    
    # 1. Buscamos un usuario administrador (Rol 1 o 2) para la prueba
    admin_prueba = db.query(models.Usuario).filter(models.Usuario.id_rol.in_([1, 2])).first()
    if not admin_prueba:
        pytest.skip("Debe existir un usuario Administrador en la BBDD para esta prueba")

    # 2. Nos aseguramos de tener un producto y un tipo de merma válidos
    producto = db.query(models.Producto).first()
    if not producto:
        producto = models.Producto(codigo_sku="TEST-MERMA", nombre_producto="Producto Test", stock_actual=100.0)
        db.add(producto)
        db.commit()
        db.refresh(producto)
        
    tipo_merma = db.query(models.TipoMerma).first()
    if not tipo_merma:
        tipo_merma = models.TipoMerma(descripcion_tipo="Merma Test")
        db.add(tipo_merma)
        db.commit()
        db.refresh(tipo_merma)

    # 3. Guardamos el stock inicial para verificar la resta matemática
    stock_inicial = float(producto.stock_actual)
    cantidad_a_mermar = 5.0

    # 4. Inyectamos la sesión del administrador
    def mock_get_current_user():
        return admin_prueba

    app.dependency_overrides[get_current_user] = mock_get_current_user

    # 5. Ejecutamos el POST al módulo de mermas
    response = client.post("/mermas/", json={
        "id_producto": producto.id_producto,
        "id_tipo_merma": tipo_merma.id_tipo_merma,
        "cantidad": cantidad_a_mermar,
        "observacion": "Prueba unitaria automatizada"
    })
    
    app.dependency_overrides.clear()

    # 6. Validamos la respuesta HTTP
    assert response.status_code == 201
    datos = response.json()
    assert "id_merma" in datos
    assert float(datos["cantidad"]) == cantidad_a_mermar

    # 7. Validamos la regla de negocio: El stock debió disminuir
    db.refresh(producto)
    assert float(producto.stock_actual) == (stock_inicial - cantidad_a_mermar)
    
    db.close()