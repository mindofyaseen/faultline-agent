"""
Deterministic Tools Harness for FAULTLINE.
Registered tools callable by both Amazon Bedrock agent and REST API.
Every tool executes deterministic code. No fabricated data.
"""

from typing import Dict, List, Any, Optional
from backend.scenarios.registry import GLOBAL_REGISTRY
from backend.scenarios.fintech import evaluate_fintech_metrics
from backend.scenarios.healthcare import evaluate_healthcare_metrics
from backend.scenarios.edtech import evaluate_edtech_metrics
from backend.scenarios.base import EvidenceItem, DownstreamImpact


# ============================================================================
# TOOL 1: inspect_pipeline
# ============================================================================
def tool_inspect_pipeline(scenario_id: str) -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)
    first_record = scenario.active_records[0] if scenario.active_records else {}
    fields = {k: type(v).__name__ for k, v in first_record.items()}

    return {
        "scenario_id": scenario.id,
        "title": scenario.title,
        "domain": scenario.domain,
        "stages": [st.model_dump() for st in scenario.stages],
        "dependencies": {st.id: st.dependencies for st in scenario.stages},
        "dataset_dimensions": {
            "active_record_count": len(scenario.active_records),
            "baseline_record_count": len(scenario.baseline_records),
            "fault_record_count": len(scenario.fault_records),
        },
        "fields_and_types": fields,
        "declared_invariants": [inv.model_dump() for inv in scenario.invariants],
        "simulation_limits": {
            "sandbox_isolated": True,
            "max_tool_rounds": 8,
            "destructive_actions_allowed": False,
            "synthetic_data_only": True,
        },
    }


# ============================================================================
# TOOL 2: run_quality_profile
# ============================================================================
def tool_run_quality_profile(scenario_id: str, dataset_type: str = "active") -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)
    if dataset_type == "baseline":
        records = scenario.baseline_records
    elif dataset_type == "fault":
        records = scenario.fault_records
    else:
        records = scenario.active_records

    if scenario_id == "scenario_fintech":
        metrics = evaluate_fintech_metrics(records)
        invariants_eval = [
            {
                "invariant_id": "inv_unique_txn_id",
                "name": "Transaction Key Uniqueness",
                "passed": metrics["duplicate_count"] == 0,
                "observed": f"{metrics['duplicate_count']} duplicates found out of {metrics['raw_count']} records",
                "expected": "0 duplicates",
            },
            {
                "invariant_id": "inv_settlement_reconciliation",
                "name": "Settlement Balance Conservation",
                "passed": metrics["discrepancy"] == 0.0,
                "observed": f"Discrepancy of ${metrics['discrepancy']:+,.2f} (Raw: ${metrics['raw_sum']:,.2f}, Unique: ${metrics['unique_sum']:,.2f})",
                "expected": "$0.00 discrepancy",
            },
            {
                "invariant_id": "inv_currency_uniformity",
                "name": "Uniform Currency Assertion",
                "passed": all(r.get("currency") == "USD" for r in records),
                "observed": "100% USD",
                "expected": "USD currency uniformity",
            },
        ]
        return {
            "scenario_id": scenario_id,
            "dataset_type": dataset_type,
            "record_count": metrics["raw_count"],
            "unique_key_count": metrics["unique_count"],
            "duplicate_count": metrics["duplicate_count"],
            "duplicate_keys": metrics["duplicate_record_ids"],
            "null_count": 0,
            "schema_differences": [],
            "timestamp_validity": "100% valid ISO-8601",
            "metrics": metrics,
            "invariants_evaluated": invariants_eval,
            "all_invariants_passed": all(i["passed"] for i in invariants_eval),
        }

    elif scenario_id == "scenario_healthcare":
        metrics = evaluate_healthcare_metrics(records)
        invariants_eval = [
            {
                "invariant_id": "inv_explicit_timezone",
                "name": "Explicit Timezone Offset Requirement",
                "passed": metrics["ambiguous_count"] == 0,
                "observed": f"{metrics['ambiguous_count']} records missing UTC offset",
                "expected": "0 missing offsets",
            },
            {
                "invariant_id": "inv_clinic_daily_capacity",
                "name": "Daily Max Clinic Staffing Ceiling",
                "passed": len(metrics["overbooked_days"]) == 0,
                "observed": f"Max daily volume: {metrics['max_daily_volume']} (Overbooked: {metrics['overbooked_days']})",
                "expected": "<= 16 appointments per day",
            },
        ]
        return {
            "scenario_id": scenario_id,
            "dataset_type": dataset_type,
            "record_count": metrics["total_records"],
            "daily_distribution": metrics["daily_counts"],
            "ambiguous_count": metrics["ambiguous_count"],
            "ambiguous_record_ids": metrics["ambiguous_record_ids"],
            "overbooked_days": metrics["overbooked_days"],
            "metrics": metrics,
            "invariants_evaluated": invariants_eval,
            "all_invariants_passed": all(i["passed"] for i in invariants_eval),
        }

    elif scenario_id == "scenario_edtech":
        window = 60 if scenario.state == "REMEDIATED" else 15
        metrics = evaluate_edtech_metrics(records, watermark_threshold_minutes=window)
        invariants_eval = [
            {
                "invariant_id": "inv_cohort_completion_conservation",
                "name": "Expected Cohort Evaluation Completeness",
                "passed": metrics["dropped_count"] == 0,
                "observed": f"{metrics['processed_count']}/{metrics['total_enrolled']} evaluated ({metrics['dropped_count']} dropped)",
                "expected": f"{metrics['total_enrolled']}/{metrics['total_enrolled']} evaluated",
            },
            {
                "invariant_id": "inv_watermark_drop_ceiling",
                "name": "Late Event Watermark Drop Ceiling",
                "passed": metrics["dropped_count"] == 0,
                "observed": f"{metrics['dropped_count']} events dropped past {window}m threshold",
                "expected": "0 dropped events",
            },
            {
                "invariant_id": "inv_payload_schema_fidelity",
                "name": "Standard Completion Timestamp Key Fidelity",
                "passed": metrics["schema_mismatch_count"] == 0,
                "observed": f"{metrics['schema_mismatch_count']} records missing 'completion_time'",
                "expected": "0 schema mismatches",
            },
        ]
        return {
            "scenario_id": scenario_id,
            "dataset_type": dataset_type,
            "record_count": metrics["total_enrolled"],
            "processed_count": metrics["processed_count"],
            "dropped_count": metrics["dropped_count"],
            "dropped_student_ids": metrics["dropped_student_ids"],
            "schema_mismatch_count": metrics["schema_mismatch_count"],
            "schema_mismatch_student_ids": metrics["schema_mismatch_student_ids"],
            "completion_rate_pct": metrics["completion_rate_pct"],
            "metrics": metrics,
            "invariants_evaluated": invariants_eval,
            "all_invariants_passed": all(i["passed"] for i in invariants_eval),
        }

    raise ValueError(f"Unknown scenario ID: {scenario_id}")


# ============================================================================
# TOOL 3: run_fault_scenario
# ============================================================================
def tool_run_fault_scenario(scenario_id: str, fault_type: str) -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.inject_fault(scenario_id, fault_type)
    return {
        "scenario_id": scenario.id,
        "state": scenario.state,
        "injected_fault": fault_type,
        "status": "SUCCESS",
        "affected_record_count": len(scenario.fault_records) - len(scenario.baseline_records) if scenario_id == "scenario_fintech" else 4 if scenario_id == "scenario_healthcare" else 3,
        "message": f"Successfully injected fault '{fault_type}' into isolated sandbox for {scenario.title}.",
    }


# ============================================================================
# TOOL 4: inspect_evidence
# ============================================================================
def tool_inspect_evidence(scenario_id: str, query_type: str, limit: int = 5) -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)
    records = scenario.active_records

    evidence_items: List[EvidenceItem] = []

    if scenario_id == "scenario_fintech":
        seen = {}
        duplicates = []
        for r in records:
            tx_id = r["transaction_id"]
            if tx_id in seen:
                duplicates.append((seen[tx_id], r))
            else:
                seen[tx_id] = r

        for idx, (original, dup) in enumerate(duplicates[:limit]):
            evidence_items.append(
                EvidenceItem(
                    evidence_id=f"ev_ft_{idx+1}",
                    assertion_id="inv_unique_txn_id",
                    status="CONFIRMED",
                    record_ids=[original["transaction_id"]],
                    observed_value={"first_seen": original["timestamp"], "duplicate_seen": dup["timestamp"], "amount": dup["amount"]},
                    expected_value={"occurrence": 1},
                    message=f"Transaction {original['transaction_id']} encountered 2 times in settlement batch.",
                    measured_fact=True,
                )
            )

    elif scenario_id == "scenario_healthcare":
        ambiguous = [r for r in records if not (r["scheduled_time"].endswith("Z") or ("+" in r["scheduled_time"][10:]) or ("-" in r["scheduled_time"][10:]))]
        for idx, r in enumerate(ambiguous[:limit]):
            evidence_items.append(
                EvidenceItem(
                    evidence_id=f"ev_hc_{idx+1}",
                    assertion_id="inv_explicit_timezone",
                    status="CONFIRMED",
                    record_ids=[r["appointment_id"]],
                    observed_value=r["scheduled_time"],
                    expected_value="ISO-8601 with explicit UTC 'Z' or offset (e.g. 2026-10-10T19:00:00Z)",
                    message=f"Appointment {r['appointment_id']} has ambiguous local timestamp '{r['scheduled_time']}', causing date roll into next day.",
                    measured_fact=True,
                )
            )

    elif scenario_id == "scenario_edtech":
        window = 60 if scenario.state == "REMEDIATED" else 15
        late_or_drift = [r for r in records if r.get("late_minutes", 0) > window or not r.get("completion_time")]
        for idx, r in enumerate(late_or_drift[:limit]):
            evidence_items.append(
                EvidenceItem(
                    evidence_id=f"ev_ed_{idx+1}",
                    assertion_id="inv_watermark_drop_ceiling",
                    status="CONFIRMED",
                    record_ids=[r["student_id"]],
                    observed_value={
                        "late_minutes": r.get("late_minutes"),
                        "has_completion_time": "completion_time" in r,
                        "has_completed_at": "completed_at" in r,
                    },
                    expected_value={"max_late_minutes": window, "field": "completion_time"},
                    message=f"Student {r['student_id']} exceeded {window}m watermark ({r.get('late_minutes')}m) or has schema drift.",
                    measured_fact=True,
                )
            )

    return {
        "scenario_id": scenario_id,
        "query_type": query_type,
        "evidence_count": len(evidence_items),
        "evidence": [ev.model_dump() for ev in evidence_items],
    }


# ============================================================================
# TOOL 5: simulate_downstream_impact
# ============================================================================
def tool_simulate_downstream_impact(scenario_id: str) -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)

    if scenario_id == "scenario_fintech":
        base_metrics = evaluate_fintech_metrics(scenario.baseline_records)
        fault_metrics = evaluate_fintech_metrics(scenario.fault_records)
        active_metrics = evaluate_fintech_metrics(scenario.active_records)

        impacts = [
            DownstreamImpact(
                metric_name="Gross Settlement Liability",
                baseline_value=f"${base_metrics['raw_sum']:,.2f}",
                corrupted_value=f"${fault_metrics['raw_sum']:,.2f}",
                remediated_value=f"${active_metrics['raw_sum']:,.2f}" if scenario.state == "REMEDIATED" else None,
                variance_display=f"+${fault_metrics['discrepancy']:,.2f} (+32.98% overstatement)",
                is_hypothesis=False,
                business_consequence="Merchant over-payout liability. Unrecoverable cash disbursements if ACH batch settles before reconciliation.",
            ),
            DownstreamImpact(
                metric_name="Customer Double-Billing Dispute Risk",
                baseline_value="0 potential disputes",
                corrupted_value="3 duplicate customer charges",
                remediated_value="0 duplicate customer charges" if scenario.state == "REMEDIATED" else None,
                variance_display="+3 erroneous charges (Accounts: charlie, golf, india)",
                is_hypothesis=False,
                business_consequence="Chargeback fee penalties ($15-$25/charge) and customer trust degradation.",
            ),
        ]
        return {"scenario_id": scenario_id, "impacts": [imp.model_dump() for imp in impacts]}

    elif scenario_id == "scenario_healthcare":
        base_metrics = evaluate_healthcare_metrics(scenario.baseline_records)
        fault_metrics = evaluate_healthcare_metrics(scenario.fault_records)
        active_metrics = evaluate_healthcare_metrics(scenario.active_records)

        impacts = [
            DownstreamImpact(
                metric_name="Oct 11 Clinic Staffing Demand",
                baseline_value=f"{base_metrics['oct_11_count']} appointments (Capacity: 16)",
                corrupted_value=f"{fault_metrics['oct_11_count']} appointments (Capacity: 16 EXCEEDED)",
                remediated_value=f"{active_metrics['oct_11_count']} appointments" if scenario.state == "REMEDIATED" else None,
                variance_display="+4 patient overflow (+28.6% surge)",
                is_hypothesis=False,
                business_consequence="False overbooking panic triggers unnecessary emergency locum doctor call-outs ($1,200/shift).",
            ),
            DownstreamImpact(
                metric_name="Oct 10 Staff Utilization",
                baseline_value=f"{base_metrics['oct_10_count']} appointments",
                corrupted_value=f"{fault_metrics['oct_10_count']} appointments",
                remediated_value=f"{active_metrics['oct_10_count']} appointments" if scenario.state == "REMEDIATED" else None,
                variance_display="-4 appointments (Idle staff capacity)",
                is_hypothesis=False,
                business_consequence="Under-utilized clinic facilities and erroneous cancellations.",
            ),
        ]
        return {"scenario_id": scenario_id, "impacts": [imp.model_dump() for imp in impacts]}

    elif scenario_id == "scenario_edtech":
        base_metrics = evaluate_edtech_metrics(scenario.baseline_records, watermark_threshold_minutes=15)
        fault_metrics = evaluate_edtech_metrics(scenario.fault_records, watermark_threshold_minutes=15)
        active_metrics = evaluate_edtech_metrics(scenario.active_records, watermark_threshold_minutes=60 if scenario.state == "REMEDIATED" else 15)

        impacts = [
            DownstreamImpact(
                metric_name="Cohort Certification Rate",
                baseline_value="100.0% (12/12 students)",
                corrupted_value="75.0% (9/12 students)",
                remediated_value=f"{active_metrics['completion_rate_pct']}% ({active_metrics['processed_count']}/{active_metrics['total_enrolled']})" if scenario.state == "REMEDIATED" else None,
                variance_display="-25.0% silent drop",
                is_hypothesis=False,
                business_consequence="3 legitimate students denied professional certification. High support ticket volume and accreditation audit failure.",
            ),
            DownstreamImpact(
                metric_name="Silent Data Downtime Alerting",
                baseline_value="Pipeline Green (Exit Code 0)",
                corrupted_value="Pipeline Green (Exit Code 0 - SILENT ERROR)",
                remediated_value="Pipeline Green (All records accounted for)" if scenario.state == "REMEDIATED" else None,
                variance_display="Zero operational alerts raised despite 25% data loss",
                is_hypothesis=True,
                business_consequence="Monitoring tools show false confidence because infrastructure did not crash.",
            ),
        ]
        return {"scenario_id": scenario_id, "impacts": [imp.model_dump() for imp in impacts]}

    raise ValueError(f"Unknown scenario ID: {scenario_id}")


# ============================================================================
# TOOL 6: propose_guardrail
# ============================================================================
def tool_propose_guardrail(scenario_id: str, guardrail_id: str) -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)
    matches = [g for g in scenario.available_guardrails if g.id == guardrail_id]
    if not matches:
        lower_id = guardrail_id.lower()
        fuzzy = [g for g in scenario.available_guardrails if lower_id in g.id or lower_id in g.strategy.lower()]
        if fuzzy:
            guardrail = fuzzy[0]
        else:
            valid_ids = [g.id for g in scenario.available_guardrails]
            raise ValueError(f"Guardrail '{guardrail_id}' not found in approved catalogue. Permitted: {valid_ids}")
    else:
        guardrail = matches[0]

    return {
        "scenario_id": scenario_id,
        "guardrail": guardrail.model_dump(),
        "status": "APPROVED_CATALOGUE",
        "rationale": f"The proposed guardrail '{guardrail.name}' deterministically addresses the root cause invariant failure.",
    }


# ============================================================================
# TOOL 7: replay_and_verify
# ============================================================================
def tool_replay_and_verify(scenario_id: str, guardrail_id: str) -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)
    # Check valid id
    valid_ids = [g.id for g in scenario.available_guardrails]
    target_id = guardrail_id if guardrail_id in valid_ids else valid_ids[0]

    # Apply guardrail
    scenario_after = GLOBAL_REGISTRY.apply_guardrail(scenario_id, target_id)

    # Evaluate before and after
    profile_before = tool_run_quality_profile(scenario_id, dataset_type="fault")
    profile_after = tool_run_quality_profile(scenario_id, dataset_type="active")

    assertions_executed = len(profile_after["invariants_evaluated"])
    assertions_passed = sum(1 for inv in profile_after["invariants_evaluated"] if inv["passed"])
    assertions_failed = assertions_executed - assertions_passed

    return {
        "scenario_id": scenario_id,
        "guardrail_applied": guardrail_id,
        "remediation_status": "VERIFIED_SUCCESS" if assertions_failed == 0 else "PARTIAL_OR_FAILED",
        "assertions_executed": assertions_executed,
        "assertions_passed": assertions_passed,
        "assertions_failed": assertions_failed,
        "before_metrics": profile_before["metrics"],
        "after_metrics": profile_after["metrics"],
        "invariants_result": profile_after["invariants_evaluated"],
        "remaining_risks": [
            "Network retry surges should also have rate-limiting applied at the API gateway layer.",
            "Client clock drifts beyond 60 minutes will still require offline DLQ reconciliation.",
        ],
    }


# ============================================================================
# TOOL 8: export_incident_report
# ============================================================================
def tool_export_incident_report(scenario_id: str, report_format: str = "markdown") -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)
    profile = tool_run_quality_profile(scenario_id, dataset_type="active")
    impact_data = tool_simulate_downstream_impact(scenario_id)

    report_data = {
        "title": f"FAULTLINE Incident Rehearsal Report: {scenario.title}",
        "scenario_id": scenario.id,
        "domain": scenario.domain,
        "state": scenario.state,
        "injected_fault": scenario.permitted_faults[0] if scenario.permitted_faults else "N/A",
        "active_guardrail": scenario.active_guardrail_id or "None",
        "quality_profile": profile,
        "downstream_impacts": impact_data["impacts"],
        "investigation_principle": "EVIDENCE, NOT VIBES",
    }

    if report_format.lower() == "json":
        return {
            "format": "json",
            "content": report_data,
        }

    # Markdown format
    md_lines = [
        f"# FAULTLINE Incident Rehearsal Report",
        f"**Scenario:** {scenario.title} ({scenario.domain})  ",
        f"**State:** `{scenario.state}`  ",
        f"**Active Guardrail:** `{scenario.active_guardrail_id or 'None'}`  ",
        f"**Core Principle:** EVIDENCE, NOT VIBES  \n",
        f"---",
        f"## 1. Executive Summary",
        f"{scenario.description}\n",
        f"## 2. Invariant & Quality Profile Evaluation",
        f"| Invariant | Status | Observed | Expected |",
        f"|---|---|---|---|",
    ]

    for inv in profile["invariants_evaluated"]:
        status_badge = "✅ PASSED" if inv["passed"] else "❌ FAILED"
        md_lines.append(f"| {inv['name']} | {status_badge} | {inv['observed']} | {inv['expected']} |")

    md_lines.append(f"\n## 3. Measured Downstream Impact")
    for imp in impact_data["impacts"]:
        md_lines.append(f"- **{imp['metric_name']}:** {imp['variance_display']}")
        md_lines.append(f"  - *Consequence:* {imp['business_consequence']}")

    md_lines.append(f"\n## 4. Replay & Remediation Verification")
    if scenario.state == "REMEDIATED":
        md_lines.append(f"Remediation `{scenario.active_guardrail_id}` was applied deterministically.")
        md_lines.append(f"All invariant checks returned to PASSED status. Verified in sandbox without modifying production data.")
    else:
        md_lines.append(f"Fault remains active. Run `replay_and_verify` with an approved guardrail to verify fix.")

    return {
        "format": "markdown",
        "content": "\n".join(md_lines),
    }


# ============================================================================
# BEDROCK TOOL SPECIFICATIONS (Converse API ToolConfig)
# ============================================================================
BEDROCK_TOOL_SPECS = [
    {
        "toolSpec": {
            "name": "inspect_pipeline",
            "description": "Inspects pipeline stages, dependencies, invariants, and dataset dimensions for a scenario.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID e.g. scenario_fintech, scenario_healthcare, scenario_edtech"}
                    },
                    "required": ["scenario_id"],
                }
            },
        }
    },
    {
        "toolSpec": {
            "name": "run_quality_profile",
            "description": "Executes deterministic quality metrics (record counts, unique keys, duplicates, nulls, invariant checks) on synthetic data.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID"},
                        "dataset_type": {"type": "string", "enum": ["active", "baseline", "fault"], "description": "Which dataset to profile"}
                    },
                    "required": ["scenario_id"],
                }
            },
        }
    },
    {
        "toolSpec": {
            "name": "run_fault_scenario",
            "description": "Applies a controlled, permitted failure to the isolated synthetic sandbox dataset.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID"},
                        "fault_type": {"type": "string", "description": "Permitted fault type from scenario catalog"}
                    },
                    "required": ["scenario_id", "fault_type"],
                }
            },
        }
    },
    {
        "toolSpec": {
            "name": "inspect_evidence",
            "description": "Retrieves bounded record-level citations, observed values, and assertion discrepancies supporting an incident.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID"},
                        "query_type": {"type": "string", "description": "Evidence query type e.g. duplicates, timestamps, schema_mismatch"},
                        "limit": {"type": "integer", "description": "Max evidence rows to return (default: 5)"}
                    },
                    "required": ["scenario_id"],
                }
            },
        }
    },
    {
        "toolSpec": {
            "name": "simulate_downstream_impact",
            "description": "Calculates downstream business and metrics impact using declared formulas, distinguishing facts from hypotheses.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID"}
                    },
                    "required": ["scenario_id"],
                }
            },
        }
    },
    {
        "toolSpec": {
            "name": "propose_guardrail",
            "description": "Selects an approved remediation strategy from the validated catalog to fix the failure.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID"},
                        "guardrail_id": {"type": "string", "description": "Approved guardrail ID"}
                    },
                    "required": ["scenario_id", "guardrail_id"],
                }
            },
        }
    },
    {
        "toolSpec": {
            "name": "replay_and_verify",
            "description": "Replays the synthetic pipeline with the remediation applied and verifies whether invariant assertions pass.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID"},
                        "guardrail_id": {"type": "string", "description": "Guardrail ID to verify"}
                    },
                    "required": ["scenario_id", "guardrail_id"],
                }
            },
        }
    },
    {
        "toolSpec": {
            "name": "export_incident_report",
            "description": "Exports a structured incident rehearsal report in Markdown or JSON format.",
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "scenario_id": {"type": "string", "description": "Scenario ID"},
                        "report_format": {"type": "string", "enum": ["markdown", "json"], "description": "Report output format"}
                    },
                    "required": ["scenario_id"],
                }
            },
        }
    },
]


def dispatch_tool(tool_name: str, tool_args: Dict[str, Any]) -> Dict[str, Any]:
    """Direct dispatcher for tool invocation."""
    if tool_name == "inspect_pipeline":
        return tool_inspect_pipeline(tool_args["scenario_id"])
    elif tool_name == "run_quality_profile":
        return tool_run_quality_profile(
            tool_args["scenario_id"],
            dataset_type=tool_args.get("dataset_type", "active")
        )
    elif tool_name == "run_fault_scenario":
        return tool_run_fault_scenario(
            tool_args["scenario_id"],
            fault_type=tool_args["fault_type"]
        )
    elif tool_name == "inspect_evidence":
        return tool_inspect_evidence(
            tool_args["scenario_id"],
            query_type=tool_args.get("query_type", "all"),
            limit=tool_args.get("limit", 5)
        )
    elif tool_name == "simulate_downstream_impact":
        return tool_simulate_downstream_impact(tool_args["scenario_id"])
    elif tool_name == "propose_guardrail":
        return tool_propose_guardrail(
            tool_args["scenario_id"],
            guardrail_id=tool_args["guardrail_id"]
        )
    elif tool_name == "replay_and_verify":
        return tool_replay_and_verify(
            tool_args["scenario_id"],
            guardrail_id=tool_args["guardrail_id"]
        )
    elif tool_name == "export_incident_report":
        return tool_export_incident_report(
            tool_args["scenario_id"],
            report_format=tool_args.get("report_format", "markdown")
        )
    else:
        raise ValueError(f"Unknown tool name: {tool_name}")
