"""
Unit and integration tests for Check Before You Buy endpoint:
POST /api/check-land (backend/app/check_land.py, backend/app/main.py)
Verifies:
1. Found + clean parcel (e.g., Shantipur Dag 1234, demo PDF deed 2026-0017)
2. Found + linked cases (e.g., Gulshan Dag 550 with court case, Savar Dag 784 with mortgage)
3. Not found parcel (returns status "not_found", never an error)
4. Manual JSON payload ({"extracted_data": {...}})
5. Invalid upload / missing inputs validation
"""

import io
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_check_land_found_clean_parcel():
    # Shantipur Dag 1234, Khatian 456
    payload = {
        "extracted_data": {
            "mouza": "শান্তিপুর (কাল্পনিক)",
            "khatian_no": "456",
            "dag_no": "1234",
            "deed_no": "2026-0017",
            "seller_name": "মোঃ রহিম উদ্দিন",
            "buyer_name": "মোঃ সাকিব হাসান",
            "area_decimal": "10.0"
        }
    }
    response = client.post("/api/check-land", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "found"
    assert "DEMO DATA" in data["disclaimer"]
    assert data["parcel"] is not None
    assert data["parcel"]["dag_no"] == "1234"
    assert data["parcel"]["khatian_no"] == "456"
    assert len(data["deed_info"]) >= 5

    # Ownership history present, newest first
    assert len(data["ownership_history"]) >= 1
    assert data["ownership_history"][0]["is_current"] is True

    # Transactions present
    assert len(data["transactions"]) >= 1

    # Clean parcel -> no active cases
    assert isinstance(data["cases"], list)
    assert len(data["cases"]) == 0

    # Not checked list
    assert len(data["not_checked"]) >= 4
    assert len(data["next_official_steps"]) >= 3

def test_check_land_found_with_cases():
    # Gulshan Plot 550 has a pending civil title suit
    payload = {
        "extracted_data": {
            "mouza": "গুলশান (Gulshan)",
            "khatian_no": "220",
            "dag_no": "550",
            "deed_no": "4520/2023",
            "seller_name": "মোঃ মোর্শেদ আলম",
            "buyer_name": "তারেক রহমান"
        }
    }
    response = client.post("/api/check-land", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "found"
    assert data["parcel"]["parcel_id"] == "PCL-DHK-GUL-015-0550"
    assert len(data["cases"]) >= 1
    assert any(c["type"] == "court_case" for c in data["cases"])

def test_check_land_not_found_returns_200_not_error():
    payload = {
        "extracted_data": {
            "mouza": "অজানা মৌজা",
            "khatian_no": "99999",
            "dag_no": "88888",
            "deed_no": "9999/2099",
            "seller_name": "অচেনা ব্যক্তি"
        }
    }
    response = client.post("/api/check-land", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "not_found"
    assert data["parcel"] is None
    assert data["ownership_history"] == []
    assert data["transactions"] == []
    assert data["cases"] == []
    assert len(data["deed_info"]) >= 1
    assert len(data["not_checked"]) >= 4

def test_check_land_sample_id_param():
    response = client.post("/api/check-land", data={"sample_id": "sample-clean"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "found"
    assert data["parcel"]["dag_no"] == "1234"

def test_check_land_missing_input_raises_400():
    response = client.post("/api/check-land", data={})
    assert response.status_code == 400
    assert "Either a document file" in response.json()["detail"]

def test_check_land_invalid_upload_extension():
    fake_file = io.BytesIO(b"malicious executable payload")
    response = client.post(
        "/api/check-land",
        files={"file": ("test.exe", fake_file, "application/octet-stream")}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]
