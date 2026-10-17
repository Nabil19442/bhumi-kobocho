import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

ALLOWED_STATUSES = {"Matched", "Mismatch", "Needs review", "Not checked"}

# ==========================================
# PHASE 5 TESTS: RELATIONSHIP GRAPH
# ==========================================

def test_graph_all_nodes_and_edges_synthetic():
    """Verify that every node, edge, and finding is explicitly marked synthetic and has disclaimer."""
    res = client.get("/api/records/graph")
    assert res.status_code == 200
    data = res.json()
    assert "DEMO DATA" in data["disclaimer"]

    # Check nodes
    for node in data["nodes"]:
        assert node.get("is_synthetic") is True
        assert "DEMO DATA" in node.get("disclaimer", "")

    # Check edges
    for edge in data["edges"]:
        assert edge.get("is_synthetic") is True
        assert edge.get("status") in ALLOWED_STATUSES

    # Check findings
    for finding in data["findings"]:
        assert finding.get("is_synthetic") is True
        assert "DEMO DATA" in finding.get("disclaimer", "")
        assert finding.get("status") in ALLOWED_STATUSES

def test_graph_resolvable_reference():
    """Verify that rec-demo-002 citing prior deed 710/2008 resolves to rec-demo-004."""
    res = client.get("/api/records/graph?record_id=rec-demo-002")
    assert res.status_code == 200
    data = res.json()

    # Find the resolved edge
    resolved_edge = next(
        (e for e in data["edges"] if e["relationship_type"] == "CITES_BAYA_DEED" and e["source"] == "rec-demo-002"),
        None
    )
    assert resolved_edge is not None
    assert resolved_edge["target"] == "rec-demo-004"
    assert resolved_edge["is_resolved"] is True
    assert resolved_edge["status"] == "Matched"
    assert resolved_edge["evidence_field"] == "prior_deed_no"
    assert resolved_edge["evidence_value"] == "710/2008"

    # Verify REFERENCE_CONSISTENT finding
    consistent_finding = next(
        (f for f in data["findings"] if f["finding_type"] == "REFERENCE_CONSISTENT" and f["source_record_id"] == "rec-demo-002"),
        None
    )
    assert consistent_finding is not None
    assert consistent_finding["status"] == "Matched"
    assert "710/2008" in consistent_finding["explanation_bn"]

def test_graph_missing_reference_detection():
    """Verify that rec-demo-001 citing missing deed 920/2005 generates an unresolved node and finding."""
    res = client.get("/api/records/graph?record_id=rec-demo-001")
    assert res.status_code == 200
    data = res.json()

    # Find the unresolved edge
    unresolved_edge = next(
        (e for e in data["edges"] if e["relationship_type"] == "CITES_BAYA_DEED" and e["source"] == "rec-demo-001"),
        None
    )
    assert unresolved_edge is not None
    assert unresolved_edge["is_resolved"] is False
    assert unresolved_edge["status"] == "Needs review"
    assert unresolved_edge["evidence_value"] == "920/2005"

    # Find unresolved target node
    unresolved_node = next(
        (n for n in data["nodes"] if n["id"] == unresolved_edge["target"]),
        None
    )
    assert unresolved_node is not None
    assert unresolved_node["node_type"] == "unresolved_reference"
    assert "920/2005" in unresolved_node["label"]
    assert unresolved_node["status"] == "Needs review"

    # Verify MISSING_REFERENCE finding
    missing_finding = next(
        (f for f in data["findings"] if f["finding_type"] == "MISSING_REFERENCE" and f["source_record_id"] == "rec-demo-001"),
        None
    )
    assert missing_finding is not None
    assert missing_finding["status"] == "Needs review"
    assert "920/2005" in missing_finding["explanation_bn"]

def test_graph_unknown_record_returns_404():
    """Verify that an unknown record_id filter returns HTTP 404."""
    res = client.get("/api/records/graph?record_id=non-existent-plot-999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_graph_focused_query_no_leakage():
    """Verify that focused query does not leak unrelated records."""
    res = client.get("/api/records/graph?record_id=rec-demo-001")
    assert res.status_code == 200
    data = res.json()

    node_ids = {n["id"] for n in data["nodes"]}
    assert "rec-demo-001" in node_ids
    # Unrelated independent parcels must NOT be in the focused graph
    assert "rec-demo-002" not in node_ids
    assert "rec-demo-003" not in node_ids
    assert "rec-demo-004" not in node_ids

def test_graph_no_sensitive_fields_exposed():
    """Verify that dummy NID and personal identifiers are omitted from graph nodes."""
    res = client.get("/api/records/graph")
    assert res.status_code == 200
    data = res.json()

    for node in data["nodes"]:
        assert "dummy_nid_last4" not in node
        assert "nid" not in node

def test_graph_summary_structure():
    """Verify graph summary counts adhere strictly to allowed statuses."""
    res = client.get("/api/records/graph")
    assert res.status_code == 200
    summary = res.json()["summary"]

    assert summary["total_nodes"] >= 4
    assert summary["total_edges"] >= 3
    assert summary["missing_references_count"] >= 1
    for status_key in ["Matched", "Mismatch", "Needs review", "Not checked"]:
        assert status_key in summary["status_counts"]

def test_graph_missing_parent_khatian_finding():
    """Verify missing parent khatian produces a deterministic MISSING_REFERENCE finding with Needs review."""
    res = client.get("/api/records/graph?record_id=rec-demo-001")
    assert res.status_code == 200
    data = res.json()
    khatian_finding = next(
        (f for f in data["findings"] if f["finding_type"] == "MISSING_REFERENCE" and f["evidence_field"] == "parent_khatian_no"),
        None
    )
    assert khatian_finding is not None
    assert khatian_finding["status"] == "Needs review"
    assert "RS-190" in khatian_finding["evidence_value"]

def test_graph_cannot_match_with_incomplete_reference():
    """Verify that a reference with conflicting or incomplete comparison conditions cannot receive Matched."""
    from backend.app.graph import build_relationship_graph
    
    # Custom test record where deed_no matches, but mouza mismatches
    inconsistent_records = [
        {
            "id": "rec-test-01",
            "deed_no": "999/2020",
            "prior_deed_no": "710/2008",
            "mouza": "মিরপুর (Mirpur)",
            "document_date": "2020-01-01"
        },
        {
            "id": "rec-test-02",
            "deed_no": "710/2008",
            "mouza": "বাড্ডা (Badda)", # Different mouza!
            "document_date": "2008-01-01"
        }
    ]
    graph = build_relationship_graph(inconsistent_records)
    # The edge must NOT be Matched
    baya_edge = next(e for e in graph["edges"] if e["relationship_type"] == "CITES_BAYA_DEED")
    assert baya_edge["status"] == "Needs review"
    # The finding must NOT be Matched
    baya_finding = next(f for f in graph["findings"] if f["source_record_id"] == "rec-test-01")
    assert baya_finding["status"] == "Needs review"


def test_graph_parcel_id_resolution():
    """Verify that synthetic parcel ID PCL-DHK-GUL-015-0550 returns 200 with complete relationship graph."""
    res = client.get("/api/records/graph?record_id=PCL-DHK-GUL-015-0550")
    assert res.status_code == 200
    data = res.json()

    assert data["focus_record_id"] == "PCL-DHK-GUL-015-0550"
    node_ids = {n["id"] for n in data["nodes"]}
    assert "PCL-DHK-GUL-015-0550" in node_ids
    assert "rec-scen-001-a" in node_ids
    assert "rec-scen-001-b" in node_ids

    # Verify parcel node attributes
    parcel_node = next(n for n in data["nodes"] if n["id"] == "PCL-DHK-GUL-015-0550")
    assert parcel_node["node_type"] == "parcel"
    assert parcel_node["dag_no"] == "550"
    assert parcel_node["khatian_no"] == "220"
    assert parcel_node["is_synthetic"] is True

    # Verify TRANSACTION_ON_PARCEL edges exist
    tx_edges = [e for e in data["edges"] if e["relationship_type"] == "TRANSACTION_ON_PARCEL"]
    assert len(tx_edges) >= 2

    # Verify duplicate conveyance finding
    dup_finding = next(
        (f for f in data["findings"] if "dup" in f.get("finding_id", "") or "দ্বৈত" in f.get("explanation_bn", "")),
        None
    )
    assert dup_finding is not None
    assert dup_finding["status"] == "Needs review"

    # Verify summary counters
    summary = data["summary"]
    assert summary["total_nodes"] == len(data["nodes"])
    assert summary["total_edges"] == len(data["edges"])
    assert summary["resolved_references_count"] >= 1
    assert summary["missing_references_count"] >= 1


def test_graph_all_demo_parcels():
    """Verify that all featured demo parcels load their graphs without error."""
    demo_parcels = [
        "PCL-DHK-GUL-015-0550",
        "PCL-DHK-SAV-045-0784",
        "PCL-DHK-MIR-028-1058",
        "PCL-CTG-KOT-088-3310",
        "PCL-SYL-SAD-032-1540",
        "PCL-DHK-SHA-012-1234",
        "PCL-RAJ-PAB-041-1058",
        "PCL-KHL-RPS-018-1540",
        "PCL-DHK-SHT-012-1234"
    ]
    for parcel_id in demo_parcels:
        res = client.get(f"/api/records/graph?record_id={parcel_id}")
        assert res.status_code == 200, f"Failed for {parcel_id}: {res.text}"
        data = res.json()
        assert len(data["nodes"]) >= 1
        assert len(data["edges"]) >= 1
        assert data["summary"]["total_nodes"] == len(data["nodes"])
        assert data["summary"]["total_edges"] == len(data["edges"])


def test_graph_transaction_id_resolution():
    """Verify that a transaction ID rec-scen-001-a returns its scoped parcel relationship graph."""
    res = client.get("/api/records/graph?record_id=rec-scen-001-a")
    assert res.status_code == 200
    data = res.json()
    assert data["focus_record_id"] == "rec-scen-001-a"
    node_ids = {n["id"] for n in data["nodes"]}
    assert "rec-scen-001-a" in node_ids
    assert "PCL-DHK-GUL-015-0550" in node_ids

