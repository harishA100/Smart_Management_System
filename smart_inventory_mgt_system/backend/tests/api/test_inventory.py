import pytest

@pytest.fixture
def test_category(client):
    resp = client.post("/api/v1/categories", json={"name": "Inv Category"})
    return resp.json()

@pytest.fixture
def test_product(client, test_category):
    payload = {
        "sku": "INV-SKU-001",
        "barcode": "INV-BAR-001",
        "name": "Inventory Test Product",
        "category_id": test_category["id"],
        "cost_price": 10.0,
        "selling_price": 15.0,
        "reorder_level": 5
    }
    resp = client.post("/api/v1/products", json=payload)
    return resp.json()

def test_product_creation_initializes_inventory(client, test_product):
    resp = client.get(f"/api/v1/inventory/{test_product['id']}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["current_stock"] == 0
    assert data["available_stock"] == 0
    assert data["stock_status"] == "out_of_stock"

def test_receive_stock(client, test_product):
    resp = client.post(
        f"/api/v1/inventory/{test_product['id']}/receive",
        json={"quantity": 10, "notes": "Initial batch"}
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["current_stock"] == 10
    assert data["available_stock"] == 10
    assert data["stock_status"] == "in_stock"

def test_receive_invalid_quantity(client, test_product):
    resp = client.post(
        f"/api/v1/inventory/{test_product['id']}/receive",
        json={"quantity": 0, "notes": "Invalid"}
    )
    assert resp.status_code == 422

def test_adjust_stock_positively(client, test_product):
    # Already has 10 from previous test (pytest ordering caveat: tests might not be ordered. Let's make a new product)
    pass

def test_adjust_and_transactions(client, test_category):
    prod = client.post("/api/v1/products", json={
        "sku": "INV-SKU-002",
        "name": "Adjust Product",
        "category_id": test_category["id"],
        "cost_price": 10.0,
        "selling_price": 15.0,
        "reorder_level": 5
    }).json()

    client.post(f"/api/v1/inventory/{prod['id']}/receive", json={"quantity": 10})

    adj_resp = client.post(f"/api/v1/inventory/{prod['id']}/adjust", json={"quantity_change": 5, "notes": "Found extra"})
    assert adj_resp.status_code == 201
    
    dmg_resp = client.post(f"/api/v1/inventory/{prod['id']}/damage", json={"quantity": 2, "notes": "Broken"})
    assert dmg_resp.status_code == 201

    exp_resp = client.post(f"/api/v1/inventory/{prod['id']}/expire", json={"quantity": 3, "notes": "Expired"})
    assert exp_resp.status_code == 201

    txn_resp = client.get(f"/api/v1/inventory/{prod['id']}/transactions")
    assert txn_resp.status_code == 200
    txns = txn_resp.json()["transactions"]
    assert len(txns) == 4
    
    types = [t["transaction_type"] for t in txns]
    assert types == ["expired", "damaged", "adjustment", "purchase"]

def test_prevent_negative_adjust(client, test_category):
    prod = client.post("/api/v1/products", json={
        "sku": "INV-SKU-NEG1",
        "name": "Negative Adjust Test",
        "category_id": test_category["id"],
        "cost_price": 10.0,
        "selling_price": 15.0
    }).json()

    client.post(f"/api/v1/inventory/{prod['id']}/receive", json={"quantity": 10})

    fail_adj = client.post(f"/api/v1/inventory/{prod['id']}/adjust", json={"quantity_change": -20, "notes": "Too much"})
    assert fail_adj.status_code == 400

def test_prevent_negative_damage(client, test_category):
    prod = client.post("/api/v1/products", json={
        "sku": "INV-SKU-NEG2",
        "name": "Negative Damage Test",
        "category_id": test_category["id"],
        "cost_price": 10.0,
        "selling_price": 15.0
    }).json()

    client.post(f"/api/v1/inventory/{prod['id']}/receive", json={"quantity": 10})

    fail_dmg = client.post(f"/api/v1/inventory/{prod['id']}/damage", json={"quantity": 20, "notes": "Over"})
    assert fail_dmg.status_code == 400

def test_inventory_summary(client, test_category):
    resp = client.get("/api/v1/inventory/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_products" in data
    assert "total_units" in data
    assert "inventory_value" in data

def test_get_inventory_list(client, test_category):
    resp = client.get("/api/v1/inventory")
    assert resp.status_code == 200
    data = resp.json()
    assert "inventory" in data
    assert type(data["inventory"]) == list
