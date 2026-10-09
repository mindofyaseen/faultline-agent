"""
Scenario B: The Timestamp That Moved the Day
Domain: Healthcare appointment-event processing.
Pipeline is green, but timezone offset omission silently shifts appointments across midnight,
exceeding clinic staffing limits and distorting daily patient volume.
"""

from typing import Dict, List, Any
import dateutil.parser
from backend.scenarios.base import (
    ScenarioDefinition,
    PipelineStage,
    InvariantRule,
    Guardrail,
)

# 29 Baseline Synthetic Clinic Appointments (15 on Oct 10, 14 on Oct 11)
# Clinic timezone is UTC-4 (Eastern Daylight Time EDT). All timestamps strictly formatted in UTC with 'Z'.
BASELINE_APPOINTMENTS: List[Dict[str, Any]] = [
    # Day 1: Oct 10 (15 appointments: 08:00 to 22:00 UTC)
    {"appointment_id": f"apt_10_{i:02d}", "patient_synth_id": f"p_syn_{100+i}", "department": "CARDIOLOGY", "scheduled_time": f"2026-10-10T{8+i:02d}:00:00Z", "duration_minutes": 30}
    for i in range(15)
] + [
    # Day 2: Oct 11 (14 appointments: 08:00 to 21:00 UTC)
    {"appointment_id": f"apt_11_{i:02d}", "patient_synth_id": f"p_syn_{200+i}", "department": "PEDIATRICS", "scheduled_time": f"2026-10-11T{8+i:02d}:00:00Z", "duration_minutes": 30}
    for i in range(14)
]

# Fault: 4 appointments from Oct 10 (apt_10_11 to apt_10_14) have missing timezone offsets
# When parsed without UTC offset, local system parser shifts them into next calendar day (Oct 11)
FAULT_APPOINTMENTS: List[Dict[str, Any]] = []
for apt in BASELINE_APPOINTMENTS:
    if apt["appointment_id"] in ["apt_10_11", "apt_10_12", "apt_10_13", "apt_10_14"]:
        idx = int(apt["appointment_id"].split("_")[-1])
        FAULT_APPOINTMENTS.append({
            "appointment_id": apt["appointment_id"],
            "patient_synth_id": apt["patient_synth_id"],
            "department": apt["department"],
            # Rolled into Oct 11 early morning and stripped 'Z' timezone indicator
            "scheduled_time": f"2026-10-11T0{idx-10}:30:00",
            "duration_minutes": apt["duration_minutes"],
        })
    else:
        FAULT_APPOINTMENTS.append(dict(apt))


def build_healthcare_scenario() -> ScenarioDefinition:
    stages = [
        PipelineStage(
            id="stage_ingest",
            name="EHR Appointment Booking Feed",
            description="Ingests scheduling events from outpatient clinic booking API",
            dependencies=[],
            status="HEALTHY",
            runtime_ms=95,
        ),
        PipelineStage(
            id="stage_tz_normalizer",
            name="ISO-8601 Temporal Validator",
            description="Parses datetime strings and guarantees regional clinic timezone alignment",
            dependencies=["stage_ingest"],
            status="HEALTHY",
            runtime_ms=110,
        ),
        PipelineStage(
            id="stage_daily_agg",
            name="Daily Clinic Volume Aggregator",
            description="Buckets appointments by calendar date for resource allocation",
            dependencies=["stage_tz_normalizer"],
            status="HEALTHY",
            runtime_ms=75,
        ),
        PipelineStage(
            id="stage_capacity_gate",
            name="Staffing Capacity Guardrail",
            description="Validates daily scheduled slots against physical nurse/physician roster capacity (max 16/day)",
            dependencies=["stage_daily_agg"],
            status="HEALTHY",
            runtime_ms=65,
        ),
        PipelineStage(
            id="stage_staffing_roster",
            name="Clinical Roster Dispatcher",
            description="Dispatches on-call staffing demands to hospital ERP system",
            dependencies=["stage_capacity_gate"],
            status="HEALTHY",
            runtime_ms=80,
        ),
    ]

    invariants = [
        InvariantRule(
            id="inv_explicit_timezone",
            name="Explicit Timezone Offset Requirement",
            expression="all(has_explicit_timezone(scheduled_time))",
            severity="CRITICAL",
            description="Every appointment timestamp must contain an unambiguous timezone specifier ('Z' or '+/-HH:MM').",
        ),
        InvariantRule(
            id="inv_clinic_daily_capacity",
            name="Daily Max Clinic Staffing Ceiling",
            expression="max_daily_appointments <= 16",
            severity="CRITICAL",
            description="Daily patient volume must not exceed the clinic physical capacity threshold of 16 patients/day.",
        ),
    ]

    guardrails = [
        Guardrail(
            id="strict_utc_normalization_and_quarantine",
            name="Strict ISO-8601 Timezone Parsing & Normalization",
            strategy="TIMEZONE_CANONICALIZATION",
            description="Enforces strict parsing with dateutil/timezone validation. Non-offset strings are mapped to clinic standard timezone rather than rolling across midnight.",
            code_summary="normalize_to_clinic_tz(apt['scheduled_time'], default_tz='UTC')",
        ),
        Guardrail(
            id="quarantine_untyped_timestamps",
            name="Quarantine Ambiguous Timestamps",
            strategy="QUARANTINE_TIMESTAMPS",
            description="Routes any timestamp missing an explicit offset to a clinic triage queue.",
            code_summary="if not has_explicit_offset(t): quarantine(record)",
        ),
    ]

    return ScenarioDefinition(
        id="scenario_healthcare",
        title="The Timestamp That Moved the Day",
        tagline="Missing timezone offsets silently shift 4 appointments across midnight, causing false overbooking.",
        domain="Healthcare / Appointment Scheduling",
        description="Ambiguous timestamp formats pass generic string parsers without errors. However, 4 evening appointments roll into the next calendar day, driving Oct 11 volume to 18 (exceeding clinic capacity ceiling of 16) and triggering unjustified emergency staffing calls.",
        stages=stages,
        invariants=invariants,
        permitted_faults=["timezone_drift", "missing_tz_offset"],
        available_guardrails=guardrails,
        baseline_records=BASELINE_APPOINTMENTS,
        fault_records=FAULT_APPOINTMENTS,
        active_records=list(BASELINE_APPOINTMENTS),
        state="BASELINE",
    )


def evaluate_healthcare_metrics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Pure deterministic calculation of healthcare clinic metrics."""
    total_records = len(records)
    daily_counts: Dict[str, int] = {}
    ambiguous_records: List[Dict[str, Any]] = []

    for apt in records:
        ts_str = apt["scheduled_time"]
        has_tz = ts_str.endswith("Z") or ("+" in ts_str[10:]) or ("-" in ts_str[10:])
        if not has_tz:
            ambiguous_records.append(apt)

        try:
            dt = dateutil.parser.parse(ts_str)
            date_key = dt.strftime("%Y-%m-%d")
        except Exception:
            date_key = "MALFORMED"

        daily_counts[date_key] = daily_counts.get(date_key, 0) + 1

    oct_10_count = daily_counts.get("2026-10-10", 0)
    oct_11_count = daily_counts.get("2026-10-11", 0)
    max_count = max(daily_counts.values()) if daily_counts else 0
    overbooked_days = {d: cnt for d, cnt in daily_counts.items() if cnt > 16}

    return {
        "total_records": total_records,
        "daily_counts": daily_counts,
        "oct_10_count": oct_10_count,
        "oct_11_count": oct_11_count,
        "ambiguous_count": len(ambiguous_records),
        "ambiguous_record_ids": [r["appointment_id"] for r in ambiguous_records],
        "max_daily_volume": max_count,
        "clinic_threshold": 16,
        "overbooked_days": overbooked_days,
        "is_corrupted": len(overbooked_days) > 0 or len(ambiguous_records) > 0,
    }
