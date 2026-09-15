import pytest
from app.models.purchase import POStatus

@pytest.fixture
def setup_po_data(client, db_session):
    # Category
    cat = client.post("/api/v1/categories", json={"name": "PO Category"}).json()
    
    # Product
    prod = client.post("/api/v1/products", json={
        "sku": "PO-PROD-001",
        "name": "PO Product 1",
        "category_id": cat["id"],
        "cost_price": 50.0,
        "selling_price": 100.0
    }).json()
    
    # Supplier
    supp = client.post("/api/v1/suppliers", json={"name": "PO Supplier"}).json()
    
    # Supplier Product
    client.post(f"/api/v1/suppliers/{supp['id']}/products", json={
        "product_id": prod["id"],
        "unit_price": 40.0,
        "minimum_order_quantity": 10
    })
    
    return {"product": prod, "supplier": supp}

def test_create_po(client, setup_po_data):
    supp = setup_po_data["supplier"]
    prod = setup_po_data["product"]
    
    response = client.post("/api/v1/purchase-orders", json={
        "supplier_id": supp["id"],
        "items": [
            {"product_id": prod["id"], "quantity": 20}
        ]
    })
    
    assert response.status_code == 201
    data = response.json()
    assert data["supplier_id"] == supp["id"]
    assert data["status"] == "draft"
    assert data["subtotal"] == 800.0 # 20 * 40.0
    assert data["total_amount"] == 800.0

def test_create_po_moq_fail(client, setup_po_data):
    supp = setup_po_data["supplier"]
    prod = setup_po_data["product"]
    
    response = client.post("/api/v1/purchase-orders", json={
        "supplier_id": supp["id"],
        "items": [
            {"product_id": prod["id"], "quantity": 5} # MOQ is 10
        ]
    })
    
    assert response.status_code == 400
    assert "MOQ" in response.json()["detail"]

def test_submit_approve_order_po(client, setup_po_data):
    supp = setup_po_data["supplier"]
    prod = setup_po_data["product"]
    
    po = client.post("/api/v1/purchase-orders", json={
        "supplier_id": supp["id"],
        "items": [{"product_id": prod["id"], "quantity": 15}]
    }).json()
    
    po_id = po["id"]
    
    # Submit
    res = client.post(f"/api/v1/purchase-orders/{po_id}/submit")
    assert res.status_code == 200
    assert res.json()["status"] == "pending_approval"
    
    # Approve
    res = client.post(f"/api/v1/purchase-orders/{po_id}/approve")
    assert res.status_code == 200
    assert res.json()["status"] == "approved"
    
    # Order
    res = client.post(f"/api/v1/purchase-orders/{po_id}/order")
    assert res.status_code == 200
    assert res.json()["status"] == "ordered"
    
    # Check incoming stock
    inv_res = client.get(f"/api/v1/inventory/{prod['id']}")
    assert inv_res.json()["incoming_stock"] == 15

def test_receive_partial_and_full(client, setup_po_data):
    supp = setup_po_data["supplier"]
    prod = setup_po_data["product"]
    
    po = client.post("/api/v1/purchase-orders", json={
        "supplier_id": supp["id"],
        "items": [{"product_id": prod["id"], "quantity": 20}]
    }).json()
    po_id = po["id"]
    
    client.post(f"/api/v1/purchase-orders/{po_id}/submit")
    client.post(f"/api/v1/purchase-orders/{po_id}/approve")
    client.post(f"/api/v1/purchase-orders/{po_id}/order")
    
    # Receive partial
    res = client.post(f"/api/v1/purchase-orders/{po_id}/receive", json={
        "items": [{"product_id": prod["id"], "received_quantity": 10}]
    })
    assert res.status_code == 200
    assert res.json()["status"] == "partially_delivered"
    
    inv_res = client.get(f"/api/v1/inventory/{prod['id']}")
    assert inv_res.json()["current_stock"] == 10
    assert inv_res.json()["incoming_stock"] == 10 # 20 - 10
    
    # Receive remainder
    res = client.post(f"/api/v1/purchase-orders/{po_id}/receive", json={
        "items": [{"product_id": prod["id"], "received_quantity": 10}]
    })
    assert res.status_code == 200
    assert res.json()["status"] == "delivered"
    
    inv_res = client.get(f"/api/v1/inventory/{prod['id']}")
    assert inv_res.json()["current_stock"] == 20
    assert inv_res.json()["incoming_stock"] == 0

def test_cancel_po(client, setup_po_data):
    supp = setup_po_data["supplier"]
    prod = setup_po_data["product"]
    
    po = client.post("/api/v1/purchase-orders", json={
        "supplier_id": supp["id"],
        "items": [{"product_id": prod["id"], "quantity": 10}]
    }).json()
    po_id = po["id"]
    
    client.post(f"/api/v1/purchase-orders/{po_id}/submit")
    client.post(f"/api/v1/purchase-orders/{po_id}/approve")
    client.post(f"/api/v1/purchase-orders/{po_id}/order")
    
    # Cancel ordered PO
    res = client.post(f"/api/v1/purchase-orders/{po_id}/cancel", json={"cancellation_reason": "No longer needed"})
    assert res.status_code == 200
    assert res.json()["status"] == "cancelled"
    
    # Check incoming stock reverted
    inv_res = client.get(f"/api/v1/inventory/{prod['id']}")
    assert inv_res.json()["incoming_stock"] == 0

def test_po_summary(client, setup_po_data):
    res = client.get("/api/v1/purchase-orders/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_purchase_orders" in data
    assert "pending_purchase_value" in data
