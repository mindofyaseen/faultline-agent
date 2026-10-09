"""
Registry and state management for FAULTLINE scenarios.
Thread-safe, isolated, reproducible state with local file caching (/tmp) for Lambda container persistence.
"""

from typing import Dict, List, Any, Optional
import copy
import json
import os
from backend.scenarios.base import ScenarioDefinition
from backend.scenarios.fintech import build_fintech_scenario
from backend.scenarios.healthcare import build_healthcare_scenario
from backend.scenarios.edtech import build_edtech_scenario

STATE_FILE = "/tmp/faultline_state.json" if os.path.exists("/tmp") else "faultline_state.json"


class ScenarioRegistry:
    def __init__(self):
        self._scenario_factories = {
            "scenario_fintech": build_fintech_scenario,
            "scenario_healthcare": build_healthcare_scenario,
            "scenario_edtech": build_edtech_scenario,
        }
        self._active_scenarios: Dict[str, ScenarioDefinition] = {}
        self.reset_all()

    def _persist(self):
        try:
            serialized = {
                s_id: s.model_dump() for s_id, s in self._active_scenarios.items()
            }
            with open(STATE_FILE, "w") as f:
                json.dump(serialized, f)
        except Exception:
            pass

    def _restore(self):
        try:
            if os.path.exists(STATE_FILE):
                with open(STATE_FILE, "r") as f:
                    data = json.load(f)
                for s_id, s_data in data.items():
                    if s_id in self._scenario_factories:
                        self._active_scenarios[s_id] = ScenarioDefinition(**s_data)
        except Exception:
            pass

    def reset_all(self):
        self._active_scenarios = {
            s_id: factory() for s_id, factory in self._scenario_factories.items()
        }
        self._persist()

    def reset_scenario(self, scenario_id: str) -> ScenarioDefinition:
        if scenario_id not in self._scenario_factories:
            raise ValueError(f"Unknown scenario ID: {scenario_id}")
        fresh = self._scenario_factories[scenario_id]()
        self._active_scenarios[scenario_id] = fresh
        self._persist()
        return fresh

    def get_scenario(self, scenario_id: str) -> ScenarioDefinition:
        self._restore()
        if scenario_id not in self._active_scenarios:
            raise ValueError(f"Unknown scenario ID: {scenario_id}")
        return self._active_scenarios[scenario_id]

    def list_scenarios(self) -> List[Dict[str, Any]]:
        self._restore()
        result = []
        for s_id, s in self._active_scenarios.items():
            result.append({
                "id": s.id,
                "title": s.title,
                "tagline": s.tagline,
                "domain": s.domain,
                "description": s.description,
                "state": s.state,
                "stages_count": len(s.stages),
                "invariants_count": len(s.invariants),
                "permitted_faults": s.permitted_faults,
                "available_guardrails": [g.model_dump() for g in s.available_guardrails],
            })
        return result

    def inject_fault(self, scenario_id: str, fault_type: str) -> ScenarioDefinition:
        self._restore()
        scenario = self.get_scenario(scenario_id)
        if fault_type not in scenario.permitted_faults:
            raise ValueError(
                f"Fault '{fault_type}' is not permitted for scenario '{scenario_id}'. Permitted: {scenario.permitted_faults}"
            )

        scenario.state = "FAULT_INJECTED"
        scenario.active_records = copy.deepcopy(scenario.fault_records)
        scenario.active_guardrail_id = None

        if scenario_id == "scenario_fintech":
            for st in scenario.stages:
                if st.id == "stage_dedupe":
                    st.status = "FAILED"
                elif st.id in ["stage_settlement", "stage_ledger"]:
                    st.status = "WARNING"
                else:
                    st.status = "HEALTHY"
        elif scenario_id == "scenario_healthcare":
            for st in scenario.stages:
                if st.id in ["stage_tz_normalizer", "stage_capacity_gate"]:
                    st.status = "FAILED"
                else:
                    st.status = "HEALTHY"
        elif scenario_id == "scenario_edtech":
            for st in scenario.stages:
                if st.id in ["stage_watermark", "stage_module_eval"]:
                    st.status = "FAILED"
                else:
                    st.status = "HEALTHY"

        self._active_scenarios[scenario_id] = scenario
        self._persist()
        return scenario

    def apply_guardrail(self, scenario_id: str, guardrail_id: str) -> ScenarioDefinition:
        self._restore()
        scenario = self.get_scenario(scenario_id)
        valid_ids = [g.id for g in scenario.available_guardrails]
        if guardrail_id not in valid_ids:
            # Fuzzy match or select first available
            lower_id = guardrail_id.lower()
            fuzzy = [g for g in scenario.available_guardrails if lower_id in g.id or lower_id in g.strategy.lower()]
            if fuzzy:
                guardrail_id = fuzzy[0].id
            else:
                guardrail_id = scenario.available_guardrails[0].id

        scenario.active_guardrail_id = guardrail_id
        scenario.state = "REMEDIATED"

        if scenario_id == "scenario_fintech":
            seen = set()
            deduped = []
            for r in scenario.active_records:
                if r["transaction_id"] not in seen:
                    seen.add(r["transaction_id"])
                    deduped.append(r)
            scenario.active_records = deduped

        elif scenario_id == "scenario_healthcare":
            normalized = []
            for r in scenario.active_records:
                item = dict(r)
                if item["appointment_id"].startswith("apt_10_"):
                    i_val = int(item["appointment_id"].split("_")[-1])
                    item["scheduled_time"] = f"2026-10-10T{8+i_val:02d}:00:00Z"
                normalized.append(item)
            scenario.active_records = normalized

        elif scenario_id == "scenario_edtech":
            remediated = []
            for r in scenario.active_records:
                item = dict(r)
                if "completed_at" in item:
                    item["completion_time"] = item.pop("completed_at")
                remediated.append(item)
            scenario.active_records = remediated

        for st in scenario.stages:
            st.status = "REMEDIATED"

        self._active_scenarios[scenario_id] = scenario
        self._persist()
        return scenario


GLOBAL_REGISTRY = ScenarioRegistry()
