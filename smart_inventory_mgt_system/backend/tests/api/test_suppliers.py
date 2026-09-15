import pytest
from app.models.supplier import Supplier, SupplierProduct
from app.models.product import Product
from app.models.purchase import PurchaseOrder, POStatus

@pytest.fixture
def setup_supplier_data(client, db_session):
    # Create category and product
    cat = client.post("/api/v1/categories", json={"name": "Supplier Category"}).json()
    prod = client.post("/api/v1/products", json={
        "sku": "SUPP-PROD-001",
        "name": "Supplier Product 1",
        "category_id": cat["id"],
        "cost_price": 50.0,
        "selling_price": 100.0
    }).json()
    
    return {"category": cat, "product": prod}

def test_create_supplier(client):
    response = client.post("/api/v1/suppliers", json={
        "name": "Acme Corp",
        "email": "contact@acme.com",
        "city": "Metropolis"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Acme Corp"
    assert data["email"] == "contact@acme.com"
    assert data["city"] == "Metropolis"
    assert data["is_active"] == True

def test_create_supplier_duplicate(client):
    client.post("/api/v1/suppliers", json={"name": "Duplicate Corp"})
    response = client.post("/api/v1/suppliers", json={"name": "Duplicate Corp"})
    assert response.status_code == 400

def test_get_suppliers(client):
    client.post("/api/v1/suppliers", json={"name": "Searchable Corp", "contact_person": "John Doe"})
    response = client.get("/api/v1/suppliers?name=Searchable&contact_person=John")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["name"] == "Searchable Corp"

def test_get_supplier(client):
    supp = client.post("/api/v1/suppliers", json={"name": "Get Corp"}).json()
    response = client.get(f"/api/v1/suppliers/{supp['id']}")
    assert response.status_code == 200
    assert response.json()["name"] == "Get Corp"

def test_update_supplier(client):
    supp = client.post("/api/v1/suppliers", json={"name": "Old Name Corp"}).json()
    response = client.put(f"/api/v1/suppliers/{supp['id']}", json={"name": "New Name Corp", "city": "Gotham"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name Corp"
    assert data["city"] == "Gotham"

def test_soft_delete_supplier(client):
    supp = client.post("/api/v1/suppliers", json={"name": "To Delete Corp"}).json()
    response = client.delete(f"/api/v1/suppliers/{supp['id']}")
    assert response.status_code == 200
    
    response = client.get(f"/api/v1/suppliers/{supp['id']}")
    assert response.json()["is_active"] == False

def test_add_supplier_product(client, setup_supplier_data):
    supp = client.post("/api/v1/suppliers", json={"name": "Supplier 1"}).json()
    prod_id = setup_supplier_data["product"]["id"]
    
    response = client.post(f"/api/v1/suppliers/{supp['id']}/products", json={
        "product_id": prod_id,
        "unit_price": 45.0,
        "minimum_order_quantity": 100,
        "lead_time_days": 7
    })
    
    assert response.status_code == 201
    data = response.json()
    assert data["product_id"] == prod_id
    assert data["unit_price"] == 45.0
    assert data["product_name"] == "Supplier Product 1"

def test_prevent_duplicate_supplier_product(client, setup_supplier_data):
    supp = client.post("/api/v1/suppliers", json={"name": "Supplier 2"}).json()
    prod_id = setup_supplier_data["product"]["id"]
    
    client.post(f"/api/v1/suppliers/{supp['id']}/products", json={
        "product_id": prod_id,
        "unit_price": 45.0
    })
    
    response = client.post(f"/api/v1/suppliers/{supp['id']}/products", json={
        "product_id": prod_id,
        "unit_price": 50.0
    })
    
    assert response.status_code == 400

def test_update_supplier_product(client, setup_supplier_data):
    supp = client.post("/api/v1/suppliers", json={"name": "Supplier 3"}).json()
    prod_id = setup_supplier_data["product"]["id"]
    
    client.post(f"/api/v1/suppliers/{supp['id']}/products", json={
        "product_id": prod_id,
        "unit_price": 45.0
    })
    
    response = client.put(f"/api/v1/suppliers/{supp['id']}/products/{prod_id}", json={
        "unit_price": 40.0,
        "is_preferred": True
    })
    
    assert response.status_code == 200
    assert response.json()["unit_price"] == 40.0
    assert response.json()["is_preferred"] == True

def test_remove_supplier_product(client, setup_supplier_data):
    supp = client.post("/api/v1/suppliers", json={"name": "Supplier 4"}).json()
    prod_id = setup_supplier_data["product"]["id"]
    
    client.post(f"/api/v1/suppliers/{supp['id']}/products", json={
        "product_id": prod_id,
        "unit_price": 45.0
    })
    
    response = client.delete(f"/api/v1/suppliers/{supp['id']}/products/{prod_id}")
    assert response.status_code == 204
    
    # Verify it's gone
    res = client.get(f"/api/v1/suppliers/{supp['id']}/products")
    assert len(res.json()) == 0

def test_supplier_performance(client, db_session):
    supp = client.post("/api/v1/suppliers", json={"name": "Perf Corp"}).json()
    
    # Create fake PO for performance directly in DB to bypass PO API since it's not built yet
    po = PurchaseOrder(
        po_number="PO-PERF-001",
        supplier_id=supp['id'],
        status=POStatus.delivered,
        total_amount=1000.0,
    )
    db_session.add(po)
    db_session.commit()
    
    response = client.get(f"/api/v1/suppliers/{supp['id']}/performance")
    assert response.status_code == 200
    data = response.json()
    assert data["total_purchase_orders"] == 1
    assert data["completed_purchase_orders"] == 1
    assert data["total_purchase_value"] == 1000.0

def test_supplier_comparison(client, setup_supplier_data):
    prod_id = setup_supplier_data["product"]["id"]
    
    supp1 = client.post("/api/v1/suppliers", json={"name": "Comp Corp 1"}).json()
    supp2 = client.post("/api/v1/suppliers", json={"name": "Comp Corp 2"}).json()
    
    # Add products
    client.post(f"/api/v1/suppliers/{supp1['id']}/products", json={
        "product_id": prod_id,
        "unit_price": 100.0,
        "quality_score": 4.0,
        "is_preferred": False
    })
    
    client.post(f"/api/v1/suppliers/{supp2['id']}/products", json={
        "product_id": prod_id,
        "unit_price": 90.0, # cheaper
        "quality_score": 4.5, # better quality
        "is_preferred": True
    })
    
    response = client.get(f"/api/v1/suppliers/compare/{prod_id}")
    assert response.status_code == 200
    data = response.json()
    
    suppliers = data["suppliers"]
    assert len(suppliers) == 2
    
    # supp2 should be ranked higher (index 0) due to better price, quality, and preferred status
    assert suppliers[0]["supplier_name"] == "Comp Corp 2"
    assert suppliers[1]["supplier_name"] == "Comp Corp 1"
