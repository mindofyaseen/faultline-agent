"""
API Integration Tests for FAULTLINE FastAPI Endpoints.
Verifies HTTP contracts, status codes, payload structures, and error handling.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["principle"] == "EVIDENCE, NOT VIBES"
    assert "model_id" in data


def test_list_scenarios_endpoint():
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    data = res.json()
    assert "scenarios" in data
    assert len(data["scenarios"]) == 3
    ids = [s["id"] for s in data["scenarios"]]
    assert "scenario_fintech" in ids
    assert "scenario_healthcare" in ids
    assert "scenario_edtech" in ids


def test_get_scenario_detail():
    res = client.get("/api/scenarios/scenario_fintech")
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"]["id"] == "scenario_fintech"
    assert len(data["scenario"]["stages"]) == 5
    assert len(data["scenario"]["invariants"]) == 3
    assert "quality_profile" in data
    assert "downstream_impact" in data


def test_inject_fault_endpoint():
    res = client.post(
        "/api/scenarios/scenario_fintech/inject-fault",
        json={"fault_type": "duplicate_retry_storm"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["result"]["status"] == "SUCCESS"
    assert data["quality_profile"]["duplicate_count"] == 3


def test_replay_endpoint():
    res = client.post(
        "/api/scenarios/scenario_fintech/replay",
        json={"guardrail_id": "idempotent_dedupe_on_key"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["remediation_status"] == "VERIFIED_SUCCESS"
    assert data["assertions_failed"] == 0


def test_export_report_endpoint():
    # Markdown
    res_md = client.get("/api/scenarios/scenario_fintech/report?format=markdown")
    assert res_md.status_code == 200
    assert "FAULTLINE Incident Rehearsal Report" in res_md.json()["content"]

    # JSON
    res_json = client.get("/api/scenarios/scenario_fintech/report?format=json")
    assert res_json.status_code == 200
    assert res_json.json()["format"] == "json"


def test_direct_tool_execute_endpoint():
    res = client.post(
        "/api/tools/execute",
        json={
            "tool_name": "inspect_pipeline",
            "tool_args": {"scenario_id": "scenario_healthcare"},
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["output"]["scenario_id"] == "scenario_healthcare"


def test_invalid_scenario_404():
    res = client.get("/api/scenarios/scenario_nonexistent")
    assert res.status_code == 404


def test_invalid_fault_400():
    res = client.post(
        "/api/scenarios/scenario_fintech/inject-fault",
        json={"fault_type": "invalid_fault_type_xyz"},
    )
    assert res.status_code == 400
