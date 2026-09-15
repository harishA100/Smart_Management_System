from fastapi.testclient import TestClient
from app.main import app
import traceback

client = TestClient(app)

print("--- Testing /api/v1/inventory/summary ---")
try:
    response = client.get("/api/v1/inventory/summary")
    print(f"Status: {response.status_code}")
    print(response.text)
except Exception as e:
    traceback.print_exc()

print("--- Testing /api/v1/purchase-orders ---")
try:
    response = client.get("/api/v1/purchase-orders")
    print(f"Status: {response.status_code}")
    print(response.text)
except Exception as e:
    traceback.print_exc()
