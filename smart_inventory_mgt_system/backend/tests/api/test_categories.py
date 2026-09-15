def test_create_category(client):
    response = client.post(
        "/api/v1/categories",
        json={"name": "Test Category", "description": "Test Description"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Category"
    assert data["description"] == "Test Description"
    assert "id" in data
    assert "created_at" in data

def test_create_category_duplicate_name(client):
    client.post("/api/v1/categories", json={"name": "Duplicate"})
    response = client.post("/api/v1/categories", json={"name": "Duplicate"})
    assert response.status_code == 409
    assert response.json()["detail"] == "Category with this name already exists"

def test_get_categories(client):
    client.post("/api/v1/categories", json={"name": "Cat 1"})
    client.post("/api/v1/categories", json={"name": "Cat 2"})
    
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
