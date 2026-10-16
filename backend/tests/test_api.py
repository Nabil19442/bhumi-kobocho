from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "DEMO DATA" in data["disclaimer"]

def test_api_records_and_passport():
    res = client.get("/api/records")
    assert res.status_code == 200
    records = res.json()["records"]
    assert len(records) >= 3

    # Check passport endpoint
    plot_id = records[0]["id"]
    p_res = client.get(f"/api/passport/{plot_id}?lang=bn")
    assert p_res.status_code == 200
    p_data = p_res.json()
    assert p_data["plot_id"] == plot_id
    assert "timeline" in p_data
    assert "qr_code_base64" in p_data
    assert "DEMO DATA" in p_data["disclaimer"]

def test_api_compare():
    payload = {
        "reference_record_id": "rec-demo-001",
        "extracted_data": {
            "owner_name": "মোঃ রফিকুল ইসলাম",
            "khatian_no": "412",
            "dag_no": "1058",
            "area_decimal": "15.5",
            "document_date": "2021-04-12"
        },
        "area_tolerance_decimal": 0.05,
        "language": "bn"
    }
    res = client.post("/api/compare", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert data["status_counts"]["Matched"] == 5

def test_api_guardian_simulation():
    res = client.post(
        "/api/guardian/simulate/evt-001",
        headers={"X-Guardian-Key": "demo-zenox-2026"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status_label"] == "SIMULATED"
    assert len(data["diff_report"]) >= 2
