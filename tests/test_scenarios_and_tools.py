"""
Automated Test Suite for FAULTLINE.
Covers Phase 7 requirements:
- Deterministic baseline assertions
- Seeded fault detection
- Unique key, timestamp, and schema verification
- Remediation regression passes
- Security bounds and input validation
- Report export validity
"""

import pytest
from backend.scenarios.registry import ScenarioRegistry
from backend.tools.harness import (
    tool_inspect_pipeline,
    tool_run_quality_profile,
    tool_run_fault_scenario,
    tool_inspect_evidence,
    tool_simulate_downstream_impact,
    tool_propose_guardrail,
    tool_replay_and_verify,
    tool_export_incident_report,
    dispatch_tool,
)


@pytest.fixture
def fresh_registry():
    reg = ScenarioRegistry()
    return reg


# ============================================================================
# 1. BASELINE ASSERTIONS (All scenarios pass baseline)
# ============================================================================
def test_scenario_fintech_baseline_passes():
    res = tool_run_quality_profile("scenario_fintech", dataset_type="baseline")
    assert res["all_invariants_passed"] is True
    assert res["duplicate_count"] == 0
    assert res["record_count"] == 10
    assert res["metrics"]["raw_sum"] == 1425.00
    assert res["metrics"]["discrepancy"] == 0.0


def test_scenario_healthcare_baseline_passes():
    res = tool_run_quality_profile("scenario_healthcare", dataset_type="baseline")
    assert res["all_invariants_passed"] is True
    assert res["ambiguous_count"] == 0
    assert res["record_count"] == 29
    assert len(res["overbooked_days"]) == 0
    assert res["metrics"]["oct_10_count"] == 15
    assert res["metrics"]["oct_11_count"] == 14


def test_scenario_edtech_baseline_passes():
    res = tool_run_quality_profile("scenario_edtech", dataset_type="baseline")
    assert res["all_invariants_passed"] is True
    assert res["dropped_count"] == 0
    assert res["schema_mismatch_count"] == 0
    assert res["completion_rate_pct"] == 100.0


# ============================================================================
# 2. SEEDED FAULT DETECTION
# ============================================================================
def test_scenario_fintech_fault_detection():
    # Inject fault
    tool_run_fault_scenario("scenario_fintech", "duplicate_retry_storm")
    profile = tool_run_quality_profile("scenario_fintech", dataset_type="active")

    assert profile["all_invariants_passed"] is False
    assert profile["duplicate_count"] == 3
    assert profile["record_count"] == 13
    assert "txn_103" in profile["duplicate_keys"]
    assert "txn_107" in profile["duplicate_keys"]
    assert "txn_109" in profile["duplicate_keys"]
    assert profile["metrics"]["discrepancy"] == 470.00


def test_scenario_healthcare_fault_detection():
    tool_run_fault_scenario("scenario_healthcare", "timezone_drift")
    profile = tool_run_quality_profile("scenario_healthcare", dataset_type="active")

    assert profile["all_invariants_passed"] is False
    assert profile["ambiguous_count"] == 4
    # Oct 11 capacity exceeded
    assert "2026-10-11" in profile["overbooked_days"]
    assert profile["metrics"]["oct_11_count"] == 18
    assert profile["metrics"]["oct_10_count"] == 11


def test_scenario_edtech_fault_detection():
    tool_run_fault_scenario("scenario_edtech", "late_arriving_events")
    profile = tool_run_quality_profile("scenario_edtech", dataset_type="active")

    assert profile["all_invariants_passed"] is False
    assert profile["dropped_count"] == 3
    assert profile["schema_mismatch_count"] == 1
    assert profile["completion_rate_pct"] == 75.0
    assert "stu_204" in profile["dropped_student_ids"]
    assert "stu_211" in profile["schema_mismatch_student_ids"]


# ============================================================================
# 3. EVIDENCE INSPECTION & CITATION BOUNDS
# ============================================================================
def test_inspect_evidence_bounded_citations():
    # Fintech
    tool_run_fault_scenario("scenario_fintech", "duplicate_retry_storm")
    ev_fin = tool_inspect_evidence("scenario_fintech", query_type="duplicates", limit=2)
    assert ev_fin["evidence_count"] <= 2
    for item in ev_fin["evidence"]:
        assert item["status"] == "CONFIRMED"
        assert item["measured_fact"] is True
        assert len(item["record_ids"]) > 0

    # Healthcare
    tool_run_fault_scenario("scenario_healthcare", "timezone_drift")
    ev_hc = tool_inspect_evidence("scenario_healthcare", query_type="timestamps", limit=2)
    assert ev_hc["evidence_count"] <= 2
    for item in ev_hc["evidence"]:
        assert item["status"] == "CONFIRMED"
        assert "apt_10_" in item["record_ids"][0]


# ============================================================================
# 4. DOWNSTREAM IMPACT CALCULATION
# ============================================================================
def test_simulate_downstream_impact_quantified():
    impact = tool_simulate_downstream_impact("scenario_fintech")
    assert len(impact["impacts"]) >= 2
    gross = impact["impacts"][0]
    assert gross["metric_name"] == "Gross Settlement Liability"
    assert "$470.00" in gross["variance_display"]
    assert gross["is_hypothesis"] is False


# ============================================================================
# 5. REMEDIATION REGRESSION TEST (Before vs After Replay)
# ============================================================================
def test_fintech_remediation_replay():
    tool_run_fault_scenario("scenario_fintech", "duplicate_retry_storm")
    replay = tool_replay_and_verify("scenario_fintech", "idempotent_dedupe_on_key")

    assert replay["remediation_status"] == "VERIFIED_SUCCESS"
    assert replay["assertions_failed"] == 0
    assert replay["after_metrics"]["duplicate_count"] == 0
    assert replay["after_metrics"]["raw_sum"] == 1425.00


def test_healthcare_remediation_replay():
    tool_run_fault_scenario("scenario_healthcare", "timezone_drift")
    replay = tool_replay_and_verify("scenario_healthcare", "strict_utc_normalization_and_quarantine")

    assert replay["remediation_status"] == "VERIFIED_SUCCESS"
    assert replay["assertions_failed"] == 0
    assert replay["after_metrics"]["ambiguous_count"] == 0
    assert replay["after_metrics"]["oct_10_count"] == 15
    assert replay["after_metrics"]["oct_11_count"] == 14


def test_edtech_remediation_replay():
    tool_run_fault_scenario("scenario_edtech", "late_arriving_events")
    replay = tool_replay_and_verify("scenario_edtech", "adaptive_watermark_with_schema_aliasing")

    assert replay["remediation_status"] == "VERIFIED_SUCCESS"
    assert replay["assertions_failed"] == 0
    assert replay["after_metrics"]["dropped_count"] == 0
    assert replay["after_metrics"]["completion_rate_pct"] == 100.0


# ============================================================================
# 6. SECURITY & INPUT VALIDATION BOUNDARIES
# ============================================================================
def test_invalid_scenario_id_rejected():
    with pytest.raises(ValueError):
        tool_inspect_pipeline("scenario_malicious_sql_inject")


def test_invalid_fault_type_rejected():
    with pytest.raises(ValueError):
        tool_run_fault_scenario("scenario_fintech", "drop_production_database")


def test_invalid_guardrail_rejected():
    with pytest.raises(ValueError):
        tool_propose_guardrail("scenario_fintech", "rm_rf_root")


def test_unknown_tool_rejected():
    with pytest.raises(ValueError):
        dispatch_tool("execute_bash_command", {"command": "whoami"})


# ============================================================================
# 7. INCIDENT REPORT EXPORT VALIDATION
# ============================================================================
def test_export_incident_report_markdown_and_json():
    # Markdown format
    md_rep = tool_export_incident_report("scenario_fintech", report_format="markdown")
    assert md_rep["format"] == "markdown"
    assert "# FAULTLINE Incident Rehearsal Report" in md_rep["content"]
    assert "EVIDENCE, NOT VIBES" in md_rep["content"]

    # JSON format
    json_rep = tool_export_incident_report("scenario_fintech", report_format="json")
    assert json_rep["format"] == "json"
    assert json_rep["content"]["scenario_id"] == "scenario_fintech"
    assert "quality_profile" in json_rep["content"]
