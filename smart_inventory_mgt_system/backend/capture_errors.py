import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoint(ep):
    url = f"{BASE_URL}{ep}"
    print(f"--- Testing {ep} ---")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        print(response.text)
    except Exception as e:
        print(f"Exception: {e}")

test_endpoint("/inventory/summary")
test_endpoint("/purchase-orders")
