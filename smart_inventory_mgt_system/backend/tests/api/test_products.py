import pytest

@pytest.fixture
def test_category(client):
    resp = client.post("/api/v1/categories", json={"name": "Test Cat"})
    return resp.json()

def test_create_product(client, test_category):
    payload = {
        "sku": "SKU-001",
        "barcode": "BAR-001",
        "name": "Test Product",
        "category_id": test_category["id"],
        "cost_price": 10.0,
        "selling_price": 15.0
    }
    response = client.post("/api/v1/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "SKU-001"
    assert data["name"] == "Test Product"
    assert data["category"]["id"] == test_category["id"]

def test_create_product_duplicate_sku(client, test_category):
    payload = {
        "sku": "SKU-002",
        "name": "Product 1",
        "category_id": test_category["id"],
        "cost_price": 5.0,
        "selling_price": 10.0
    }
    client.post("/api/v1/products", json=payload)
    
    payload["name"] = "Product 2"
    response = client.post("/api/v1/products", json=payload)
    assert response.status_code == 409
    assert "SKU" in response.json()["detail"]

def test_create_product_duplicate_barcode(client, test_category):
    payload1 = {
        "sku": "SKU-003",
        "barcode": "BAR-003",
        "name": "Product 3",
        "category_id": test_category["id"],
        "cost_price": 5.0,
        "selling_price": 10.0
    }
    client.post("/api/v1/products", json=payload1)
    
    payload2 = {
        "sku": "SKU-004",
        "barcode": "BAR-003",
        "name": "Product 4",
        "category_id": test_category["id"],
        "cost_price": 5.0,
        "selling_price": 10.0
    }
    response = client.post("/api/v1/products", json=payload2)
    assert response.status_code == 409
    assert "Barcode" in response.json()["detail"]

def test_create_product_invalid_category(client):
    payload = {
        "sku": "SKU-INV",
        "name": "Invalid Cat",
        "category_id": 9999,
        "cost_price": 5.0,
        "selling_price": 10.0
    }
    response = client.post("/api/v1/products", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found"

def test_get_products_pagination(client, test_category):
    for i in range(25):
        client.post("/api/v1/products", json={
            "sku": f"PAGE-SKU-{i}",
            "name": f"Page Product {i}",
            "category_id": test_category["id"],
            "cost_price": 1.0,
            "selling_price": 2.0
        })
        
    response = client.get("/api/v1/products?page=1&page_size=20")
    assert response.status_code == 200
    data = response.json()
    assert len(data["products"]) == 20
    assert data["total"] >= 25
    assert data["total_pages"] >= 2

def test_get_products_search(client, test_category):
    client.post("/api/v1/products", json={
        "sku": "SRCH-1",
        "name": "FindMe Please",
        "category_id": test_category["id"],
        "cost_price": 1.0,
        "selling_price": 2.0
    })
    
    response = client.get("/api/v1/products?search=findme")
    assert response.status_code == 200
    data = response.json()
    assert len(data["products"]) >= 1
    assert any(p["name"] == "FindMe Please" for p in data["products"])

def test_get_products_filter_category(client, test_category):
    cat2 = client.post("/api/v1/categories", json={"name": "Cat 2"}).json()
    
    client.post("/api/v1/products", json={
        "sku": "FILT-1",
        "name": "Filter 1",
        "category_id": cat2["id"],
        "cost_price": 1.0,
        "selling_price": 2.0
    })
    
    response = client.get(f"/api/v1/products?category_id={cat2['id']}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["products"]) >= 1
    assert all(p["category"]["id"] == cat2["id"] for p in data["products"])

def test_get_product_by_id(client, test_category):
    prod = client.post("/api/v1/products", json={
        "sku": "GET-1",
        "name": "Get Me",
        "category_id": test_category["id"],
        "cost_price": 1.0,
        "selling_price": 2.0
    }).json()
    
    response = client.get(f"/api/v1/products/{prod['id']}")
    assert response.status_code == 200
    assert response.json()["name"] == "Get Me"

def test_get_nonexistent_product(client):
    response = client.get("/api/v1/products/99999")
    assert response.status_code == 404

def test_update_product(client, test_category):
    prod = client.post("/api/v1/products", json={
        "sku": "UPD-1",
        "name": "Update Me",
        "category_id": test_category["id"],
        "cost_price": 1.0,
        "selling_price": 2.0
    }).json()
    
    response = client.put(f"/api/v1/products/{prod['id']}", json={"selling_price": 5.0, "name": "Updated"})
    assert response.status_code == 200
    assert response.json()["selling_price"] == 5.0
    assert response.json()["name"] == "Updated"

def test_update_nonexistent_product(client):
    response = client.put("/api/v1/products/99999", json={"selling_price": 5.0})
    assert response.status_code == 404

def test_soft_delete_product(client, test_category):
    prod = client.post("/api/v1/products", json={
        "sku": "DEL-1",
        "name": "Delete Me",
        "category_id": test_category["id"],
        "cost_price": 1.0,
        "selling_price": 2.0
    }).json()
    
    assert prod["is_active"] is True
    
    response = client.delete(f"/api/v1/products/{prod['id']}")
    assert response.status_code == 200
    
    get_resp = client.get(f"/api/v1/products/{prod['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["is_active"] is False
