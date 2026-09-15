import pytest

@pytest.fixture
def setup_sales_data(client):
    # Create category
    cat = client.post("/api/v1/categories", json={"name": "Sales Category"}).json()
    
    # Create product 1
    prod1 = client.post("/api/v1/products", json={
        "sku": "SALE-SKU-001",
        "barcode": "SALE-BAR-001",
        "name": "Sale Product 1",
        "category_id": cat["id"],
        "cost_price": 10.0,
        "selling_price": 20.0
    }).json()

    # Create product 2
    prod2 = client.post("/api/v1/products", json={
        "sku": "SALE-SKU-002",
        "name": "Sale Product 2",
        "category_id": cat["id"],
        "cost_price": 5.0,
        "selling_price": 10.0
    }).json()

    # Receive inventory for product 1 (20 items)
    client.post(f"/api/v1/inventory/{prod1['id']}/receive", json={"quantity": 20})
    
    # Receive inventory for product 2 (10 items)
    client.post(f"/api/v1/inventory/{prod2['id']}/receive", json={"quantity": 10})
    
    return {"category": cat, "prod1": prod1, "prod2": prod2}


def test_successful_sale(client, setup_sales_data):
    p1 = setup_sales_data["prod1"]
    
    payload = {
        "items": [
            {"product_id": p1["id"], "quantity": 2, "discount": 0.0}
        ],
        "discount": 5.0,
        "tax": 2.0,
        "payment_method": "cash",
        "sales_channel": "store"
    }
    
    resp = client.post("/api/v1/sales", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["invoice_number"].startswith("INV-")
    assert data["subtotal"] == 40.0 # 2 * 20.0
    assert data["total_amount"] == 37.0 # 40.0 - 5.0 + 2.0
    assert len(data["sale_items"]) == 1

    # Verify inventory was deducted
    inv = client.get(f"/api/v1/inventory/{p1['id']}").json()
    assert inv["current_stock"] == 18

    # Verify inventory transaction was created
    txns = client.get(f"/api/v1/inventory/{p1['id']}/transactions").json()["transactions"]
    sale_txn = next((t for t in txns if t["transaction_type"] == "sale"), None)
    assert sale_txn is not None
    assert sale_txn["quantity"] == -2


def test_multiple_products_in_sale(client, setup_sales_data):
    p1 = setup_sales_data["prod1"]
    p2 = setup_sales_data["prod2"]
    
    payload = {
        "items": [
            {"product_id": p1["id"], "quantity": 1},
            {"product_id": p2["id"], "quantity": 3}
        ],
        "payment_method": "card"
    }
    
    resp = client.post("/api/v1/sales", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["subtotal"] == 50.0 # 1 * 20.0 + 3 * 10.0
    assert data["total_amount"] == 50.0


def test_insufficient_stock(client, setup_sales_data):
    p1 = setup_sales_data["prod1"]
    
    payload = {
        "items": [
            {"product_id": p1["id"], "quantity": 50}
        ],
        "payment_method": "cash"
    }
    
    resp = client.post("/api/v1/sales", json=payload)
    assert resp.status_code == 400
    assert "Insufficient stock" in resp.json()["detail"]


def test_invalid_product(client):
    payload = {
        "items": [
            {"product_id": 999999, "quantity": 1}
        ],
        "payment_method": "cash"
    }
    resp = client.post("/api/v1/sales", json=payload)
    assert resp.status_code == 404


def test_inactive_product(client, setup_sales_data):
    # Make prod2 inactive
    p2 = setup_sales_data["prod2"]
    client.put(f"/api/v1/products/{p2['id']}", json={"is_active": False})
    
    payload = {
        "items": [
            {"product_id": p2["id"], "quantity": 1}
        ],
        "payment_method": "cash"
    }
    resp = client.post("/api/v1/sales", json=payload)
    assert resp.status_code == 400
    assert "inactive" in resp.json()["detail"].lower()


def test_invalid_quantity(client, setup_sales_data):
    p1 = setup_sales_data["prod1"]
    
    payload = {
        "items": [
            {"product_id": p1["id"], "quantity": 0}
        ],
        "payment_method": "cash"
    }
    resp = client.post("/api/v1/sales", json=payload)
    assert resp.status_code == 422 # Pydantic validation error


def test_get_sales_list_and_summary(client, setup_sales_data):
    resp = client.get("/api/v1/sales")
    assert resp.status_code == 200
    assert type(resp.json()["sales"]) == list
    
    resp_sum = client.get("/api/v1/sales/summary")
    assert resp_sum.status_code == 200
    data = resp_sum.json()
    assert "today_sales" in data
    assert "total_orders" in data
