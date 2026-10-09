"""
Parametric Chaos Simulation Engine for FAULTLINE.
Allows interactive fine-tuning of failure parameters (intensity, clock skew, delays).
"""

from typing import Dict, List, Any
import copy
from backend.scenarios.registry import GLOBAL_REGISTRY


def inject_parametric_chaos(
    scenario_id: str,
    chaos_mode: str,
    params: Dict[str, Any],
) -> Dict[str, Any]:
    scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)

    if scenario_id == "scenario_fintech":
        # Base records
        base = copy.deepcopy(scenario.baseline_records)
        duplicate_count = int(params.get("duplicate_count", 3))
        duplicate_count = max(1, min(duplicate_count, len(base)))

        duplicates = []
        for i in range(duplicate_count):
            item = copy.deepcopy(base[i])
            item["timestamp"] = item["timestamp"].replace("09:00:00", "09:00:02")
            duplicates.append(item)

        scenario.active_records = base + duplicates
        scenario.state = "FAULT_INJECTED"
        scenario.active_guardrail_id = None
        for st in scenario.stages:
            st.status = "FAILED" if st.id == "stage_dedupe" else "HEALTHY"

        GLOBAL_REGISTRY._active_scenarios[scenario_id] = scenario
        GLOBAL_REGISTRY._persist()

        return {
            "scenario_id": scenario_id,
            "chaos_mode": chaos_mode,
            "injected_duplicates": duplicate_count,
            "total_records": len(scenario.active_records),
            "message": f"Injected {duplicate_count} parametric duplicate events into payment ledger.",
        }

    elif scenario_id == "scenario_healthcare":
        base = copy.deepcopy(scenario.baseline_records)
        drift_count = int(params.get("drift_count", 4))
        drift_count = max(1, min(drift_count, 10))

        mutated = []
        drifted_ids = []
        for apt in base:
            if apt["appointment_id"].startswith("apt_10_") and len(drifted_ids) < drift_count:
                idx = int(apt["appointment_id"].split("_")[-1])
                drifted_ids.append(apt["appointment_id"])
                mutated.append({
                    "appointment_id": apt["appointment_id"],
                    "patient_synth_id": apt["patient_synth_id"],
                    "department": apt["department"],
                    "scheduled_time": f"2026-10-11T0{idx % 10}:30:00",  # Ambiguous rollover
                    "duration_minutes": apt["duration_minutes"],
                })
            else:
                mutated.append(dict(apt))

        scenario.active_records = mutated
        scenario.state = "FAULT_INJECTED"
        scenario.active_guardrail_id = None
        for st in scenario.stages:
            st.status = "FAILED" if st.id in ["stage_tz_normalizer", "stage_capacity_gate"] else "HEALTHY"

        GLOBAL_REGISTRY._active_scenarios[scenario_id] = scenario
        GLOBAL_REGISTRY._persist()

        return {
            "scenario_id": scenario_id,
            "chaos_mode": chaos_mode,
            "drifted_records": len(drifted_ids),
            "drifted_ids": drifted_ids,
            "message": f"Parametrically shifted {len(drifted_ids)} appointment records across midnight.",
        }

    elif scenario_id == "scenario_edtech":
        base = copy.deepcopy(scenario.baseline_records)
        delay_minutes = int(params.get("delay_minutes", 45))

        mutated = []
        for s in base:
            item = copy.deepcopy(s)
            if item["student_id"] in ["stu_204", "stu_208", "stu_211"]:
                item["late_minutes"] = delay_minutes
                if item["student_id"] == "stu_211":
                    item["completed_at"] = item.pop("completion_time", "2026-10-10T15:18:00Z")
            mutated.append(item)

        scenario.active_records = mutated
        scenario.state = "FAULT_INJECTED"
        scenario.active_guardrail_id = None
        for st in scenario.stages:
            st.status = "FAILED" if st.id in ["stage_watermark", "stage_module_eval"] else "HEALTHY"

        GLOBAL_REGISTRY._active_scenarios[scenario_id] = scenario
        GLOBAL_REGISTRY._persist()

        return {
            "scenario_id": scenario_id,
            "chaos_mode": chaos_mode,
            "delay_minutes": delay_minutes,
            "message": f"Injected parametric delay of {delay_minutes} minutes into mobile event sync.",
        }

    raise ValueError(f"Unknown scenario ID: {scenario_id}")
