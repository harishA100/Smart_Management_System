import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

endpoints = [
    "/products",
    "/inventory",
    "/inventory/summary",
    "/sales",
    "/sales/summary",
    "/suppliers",
    "/purchase-orders"
]

print("--- API TEST RESULTS ---")
for ep in endpoints:
    url = f"{BASE_URL}{ep}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            # check if it's a list or dict with items
            if isinstance(data, list):
                print(f"GET {ep} - PASS. Returned list of {len(data)} items.")
            elif isinstance(data, dict):
                # often pagination looks like { "items": [...], "total": ... }
                if "items" in data:
                    print(f"GET {ep} - PASS. Returned paginated dict with {len(data['items'])} items. Total: {data.get('total')}")
                else:
                    print(f"GET {ep} - PASS. Returned dict keys: {list(data.keys())}")
        else:
            print(f"GET {ep} - FAIL. Status: {response.status_code}, {response.text[:100]}")
    except Exception as e:
        print(f"GET {ep} - FAIL. Exception: {e}")
