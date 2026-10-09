"""
Automated Test Suite for FAULTLINE Enterprise Features.
Tests Copilot chat, parametric chaos simulator, guardrail code generation, and custom CSV profiler.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_guardrail_code_generation():
    res = client.get("/api/scenarios/scenario_fintech/guardrail-code?guardrail_id=idempotent_dedupe_on_key")
    assert res.status_code == 200
    data = res.json()
    assert "pyspark" in data["code"]
    assert "dbt" in data["code"]
    assert "lambda_python" in data["code"]
    assert "partitionBy" in data["code"]["pyspark"]


def test_parametric_chaos_injection():
    res = client.post(
        "/api/scenarios/scenario_fintech/inject-custom-fault",
        json={"chaos_mode": "custom_retry_storm", "params": {"duplicate_count": 2}},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["result"]["injected_duplicates"] == 2
    assert data["quality_profile"]["duplicate_count"] == 2


def test_custom_csv_profiling():
    sample_csv = "txn_id,user_id,amount\ntxn_1,u_1,100\ntxn_2,u_2,200\ntxn_1,u_1,100"
    res = client.post(
        "/api/custom/profile-csv",
        json={"csv_text": sample_csv, "dataset_name": "test_payments"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["row_count"] == 3
    assert data["duplicate_count"] == 1
    assert data["is_corrupted"] is True
    assert data["primary_key_candidate"] == "txn_id"


def test_interactive_chat_turn():
    res = client.post(
        "/api/scenarios/scenario_fintech/chat",
        json={"user_message": "What is the discrepancy and which transaction is duplicated?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
