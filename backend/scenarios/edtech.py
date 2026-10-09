"""
Scenario C: The Missing Learning Events
Domain: EdTech event processing.
Pipeline is green, but strict streaming watermarks and minor schema drift silently drop
3 late-arriving student completion events, causing 25% of students to be denied certificates.
"""

from typing import Dict, List, Any
from backend.scenarios.base import (
    ScenarioDefinition,
    PipelineStage,
    InvariantRule,
    Guardrail,
)

# 12 Baseline Enrolled Students Completing Course Module 4
BASELINE_STUDENTS: List[Dict[str, Any]] = [
    {"student_id": f"stu_{200+i}", "course_id": "course_aws_101", "module_id": "mod_04_final", "completion_time": f"2026-10-10T14:{10+i*2:02d}:00Z", "late_minutes": 2, "score": 85 + (i % 15)}
    for i in range(12)
]

# Fault: 3 students experience offline sync delay (45 mins late > 15m watermark) + schema drift for stu_211
FAULT_STUDENTS: List[Dict[str, Any]] = []
for s in BASELINE_STUDENTS:
    if s["student_id"] == "stu_204":
        # 45 minutes late arrival
        faulty = dict(s)
        faulty["completion_time"] = "2026-10-10T15:15:00Z"
        faulty["late_minutes"] = 45
        FAULT_STUDENTS.append(faulty)
    elif s["student_id"] == "stu_208":
        # 50 minutes late arrival
        faulty = dict(s)
        faulty["completion_time"] = "2026-10-10T15:20:00Z"
        faulty["late_minutes"] = 50
        FAULT_STUDENTS.append(faulty)
    elif s["student_id"] == "stu_211":
        # Schema drift: 'completion_time' sent as 'completed_at' + 48 minutes late
        faulty = {
            "student_id": s["student_id"],
            "course_id": s["course_id"],
            "module_id": s["module_id"],
            "completed_at": "2026-10-10T15:18:00Z",  # Renamed field!
            "late_minutes": 48,
            "score": s["score"],
        }
        FAULT_STUDENTS.append(faulty)
    else:
        FAULT_STUDENTS.append(dict(s))


def build_edtech_scenario() -> ScenarioDefinition:
    stages = [
        PipelineStage(
            id="stage_ingest",
            name="Student Activity Event Bus",
            description="Streams completion telemetry from web and mobile LMS clients",
            dependencies=[],
            status="HEALTHY",
            runtime_ms=85,
        ),
        PipelineStage(
            id="stage_watermark",
            name="Streaming Watermark Window",
            description="Tumbling window buffer with standard 15-minute late-data allowance",
            dependencies=["stage_ingest"],
            status="HEALTHY",
            runtime_ms=95,
        ),
        PipelineStage(
            id="stage_module_eval",
            name="Grading & Progression Engine",
            description="Evaluates passing scores and validates final module prerequisites",
            dependencies=["stage_watermark"],
            status="HEALTHY",
            runtime_ms=130,
        ),
        PipelineStage(
            id="stage_certification",
            name="Credential Minting & Delivery",
            description="Generates digital completion certificates and updates official student transcripts",
            dependencies=["stage_module_eval"],
            status="HEALTHY",
            runtime_ms=115,
        ),
        PipelineStage(
            id="stage_dashboard",
            name="LMS Executive Analytics",
            description="Tracks cohort completion rates and instructional effectiveness",
            dependencies=["stage_certification"],
            status="HEALTHY",
            runtime_ms=70,
        ),
    ]

    invariants = [
        InvariantRule(
            id="inv_cohort_completion_conservation",
            name="Expected Cohort Evaluation Completeness",
            expression="evaluated_students == total_enrolled_candidates",
            severity="CRITICAL",
            description="Every student who completes the module must be evaluated without silent drops.",
        ),
        InvariantRule(
            id="inv_watermark_drop_ceiling",
            name="Late Event Watermark Drop Ceiling",
            expression="dropped_events == 0",
            severity="CRITICAL",
            description="Event stream watermark must not discard legitimate offline client sync events.",
        ),
        InvariantRule(
            id="inv_payload_schema_fidelity",
            name="Standard Completion Timestamp Key Fidelity",
            expression="all('completion_time' in r for r in records)",
            severity="WARNING",
            description="All student event payloads must contain standard 'completion_time' field.",
        ),
    ]

    guardrails = [
        Guardrail(
            id="adaptive_watermark_with_schema_aliasing",
            name="Adaptive 60-Minute Watermark + Schema Alias Resolver",
            strategy="ADAPTIVE_WATERMARK_AND_SCHEMA_ALIAS",
            description="Extends tumbling grace window from 15m to 60m for mobile syncs and automatically resolves schema aliases ('completed_at' -> 'completion_time').",
            code_summary="if 'completed_at' in r: r['completion_time'] = r.pop('completed_at')\nwatermark_window = 60",
        ),
        Guardrail(
            id="quarantine_unrecognized_schema",
            name="Schema Evolution Quarantine Route",
            strategy="QUARANTINE_SCHEMA",
            description="Routes schema drift events to an automated transformation queue.",
            code_summary="if missing_expected_key(r): route_to_schema_healer(r)",
        ),
    ]

    return ScenarioDefinition(
        id="scenario_edtech",
        title="The Missing Learning Events",
        tagline="A strict 15m watermark silently drops 3 delayed mobile syncs, denying 25% of students their certificates.",
        domain="EdTech / LMS Event Stream",
        description="Students submit final exams over offline mobile connections. Late events arrive past the rigid 15-minute streaming watermark, and one event contains a renamed timestamp key. The pipeline runs green, but only 9 of 12 students receive certificates.",
        stages=stages,
        invariants=invariants,
        permitted_faults=["late_arriving_events", "schema_drift"],
        available_guardrails=guardrails,
        baseline_records=BASELINE_STUDENTS,
        fault_records=FAULT_STUDENTS,
        active_records=list(BASELINE_STUDENTS),
        state="BASELINE",
    )


def evaluate_edtech_metrics(records: List[Dict[str, Any]], watermark_threshold_minutes: int = 15) -> Dict[str, Any]:
    """Pure deterministic calculation of EdTech streaming metrics."""
    total_enrolled = len(records)
    processed_records: List[Dict[str, Any]] = []
    dropped_records: List[Dict[str, Any]] = []
    schema_mismatch_records: List[Dict[str, Any]] = []

    for r in records:
        # Check schema
        ts_val = r.get("completion_time")
        if not ts_val:
            schema_mismatch_records.append(r)
            # If no completion_time, also check if completed_at exists
            ts_val = r.get("completed_at")

        late_min = r.get("late_minutes", 0)
        if late_min > watermark_threshold_minutes or not r.get("completion_time"):
            dropped_records.append(r)
        else:
            processed_records.append(r)

    completion_rate_pct = round((len(processed_records) / total_enrolled) * 100, 1) if total_enrolled > 0 else 0.0

    return {
        "total_enrolled": total_enrolled,
        "processed_count": len(processed_records),
        "dropped_count": len(dropped_records),
        "dropped_student_ids": [r["student_id"] for r in dropped_records],
        "schema_mismatch_count": len(schema_mismatch_records),
        "schema_mismatch_student_ids": [r["student_id"] for r in schema_mismatch_records],
        "completion_rate_pct": completion_rate_pct,
        "watermark_window_minutes": watermark_threshold_minutes,
        "is_corrupted": len(dropped_records) > 0,
    }
