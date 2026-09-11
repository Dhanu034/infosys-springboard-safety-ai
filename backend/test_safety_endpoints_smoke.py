import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_existing_safety_endpoints():
    print("=== Testing Existing Safety Endpoints (Milestone 1 & 2) ===")
    
    # 1. Root
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.status_code}"
    print(f"[OK] GET / -> HTTP 200: {res.json()['message']}")
    
    # 2. Health
    res = client.get("/health")
    assert res.status_code == 200, f"Health failed: {res.status_code}"
    data = res.json()
    print(f"[OK] GET /health -> HTTP 200: status={data['status']}, db={data['database_status']}")
    
    # 3. Safety Summary
    res = client.get("/api/safety/summary?project_id=PRJ-101")
    assert res.status_code == 200, f"Summary failed: {res.status_code}"
    data = res.json()
    print(f"[OK] GET /api/safety/summary -> HTTP 200: workers_monitored={data['total_workers_monitored']}, safety_score={data['safety_score']}, open_violations={data['open_violations']}")
    
    # 4. Violations List
    res = client.get("/api/safety/violations?project_id=PRJ-101")
    assert res.status_code == 200, f"Violations failed: {res.status_code}"
    violations = res.json()
    print(f"[OK] GET /api/safety/violations -> HTTP 200: {len(violations)} records returned")
    
    # 5. Alerts List
    res = client.get("/api/safety/alerts?project_id=PRJ-101")
    assert res.status_code == 200, f"Alerts failed: {res.status_code}"
    alerts = res.json()
    print(f"[OK] GET /api/safety/alerts -> HTTP 200: {len(alerts)} alert records returned")
    
    print("\n>>> ALL EXISTING SAFETY ENDPOINTS TESTED AND VERIFIED 100% WORKING! <<<")

if __name__ == "__main__":
    test_existing_safety_endpoints()
