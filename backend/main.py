"""
FastAPI application for FAULTLINE.
Serves the REST API for scenarios, tool execution, and Bedrock agent investigations.
"""

import os
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.scenarios.registry import GLOBAL_REGISTRY
from backend.agent.bedrock_agent import FaultlineAgent
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

app = FastAPI(
    title="FAULTLINE API",
    description="Data-Pipeline Resilience and Failure Rehearsal Agent API",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = FaultlineAgent()


class FaultInjectRequest(BaseModel):
    fault_type: str


class GuardrailRequest(BaseModel):
    guardrail_id: str


class InvestigateRequest(BaseModel):
    user_prompt: Optional[str] = None


class ToolExecuteRequest(BaseModel):
    tool_name: str
    tool_args: Dict[str, Any]


@app.post("/api/tools/execute")
def execute_tool_endpoint(payload: ToolExecuteRequest):
    try:
        from backend.tools.harness import dispatch_tool
        out = dispatch_tool(payload.tool_name, payload.tool_args)
        return {"status": "SUCCESS", "tool_name": payload.tool_name, "output": out}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/health")
def get_health():
    return {
        "status": "HEALTHY",
        "service": "FAULTLINE Data Resilience Engine",
        "version": "1.0.0",
        "aws_region": os.environ.get("AWS_REGION", "us-east-1"),
        "model_id": agent.model_id,
        "principle": "EVIDENCE, NOT VIBES",
    }


@app.get("/api/scenarios")
def list_scenarios():
    return {"scenarios": GLOBAL_REGISTRY.list_scenarios()}


@app.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    try:
        scenario = GLOBAL_REGISTRY.get_scenario(scenario_id)
        profile = tool_run_quality_profile(scenario_id, dataset_type="active")
        impact = tool_simulate_downstream_impact(scenario_id)
        return {
            "scenario": {
                "id": scenario.id,
                "title": scenario.title,
                "tagline": scenario.tagline,
                "domain": scenario.domain,
                "description": scenario.description,
                "state": scenario.state,
                "stages": [s.model_dump() for s in scenario.stages],
                "invariants": [inv.model_dump() for inv in scenario.invariants],
                "permitted_faults": scenario.permitted_faults,
                "available_guardrails": [g.model_dump() for g in scenario.available_guardrails],
                "active_guardrail_id": scenario.active_guardrail_id,
            },
            "quality_profile": profile,
            "downstream_impact": impact["impacts"],
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/scenarios/{scenario_id}/reset")
def reset_scenario(scenario_id: str):
    try:
        fresh = GLOBAL_REGISTRY.reset_scenario(scenario_id)
        return {"status": "SUCCESS", "message": f"Reset {scenario_id} to baseline.", "state": fresh.state}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/scenarios/{scenario_id}/inject-fault")
def inject_fault(scenario_id: str, payload: FaultInjectRequest):
    try:
        res = tool_run_fault_scenario(scenario_id, payload.fault_type)
        profile = tool_run_quality_profile(scenario_id, dataset_type="active")
        impact = tool_simulate_downstream_impact(scenario_id)
        return {
            "result": res,
            "quality_profile": profile,
            "downstream_impact": impact["impacts"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/scenarios/{scenario_id}/investigate")
def run_investigation(scenario_id: str, payload: InvestigateRequest = Body(default=InvestigateRequest())):
    try:
        investigation_result = agent.run_investigation(
            scenario_id=scenario_id,
            user_prompt=payload.user_prompt,
        )
        return investigation_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation failed: {str(e)}")


@app.post("/api/scenarios/{scenario_id}/guardrail")
def apply_guardrail(scenario_id: str, payload: GuardrailRequest):
    try:
        res = tool_propose_guardrail(scenario_id, payload.guardrail_id)
        GLOBAL_REGISTRY.apply_guardrail(scenario_id, payload.guardrail_id)
        profile = tool_run_quality_profile(scenario_id, dataset_type="active")
        impact = tool_simulate_downstream_impact(scenario_id)
        return {
            "result": res,
            "quality_profile": profile,
            "downstream_impact": impact["impacts"],
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/scenarios/{scenario_id}/replay")
def replay_scenario(scenario_id: str, payload: GuardrailRequest):
    try:
        replay_result = tool_replay_and_verify(scenario_id, payload.guardrail_id)
        return replay_result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/scenarios/{scenario_id}/report")
def export_report(scenario_id: str, format: str = "markdown"):
    try:
        report = tool_export_incident_report(scenario_id, report_format=format)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


class CustomFaultRequest(BaseModel):
    chaos_mode: str
    params: Dict[str, Any] = {}


class ChatRequest(BaseModel):
    user_message: str
    history: Optional[List[Dict[str, str]]] = None


class CsvProfileRequest(BaseModel):
    csv_text: str
    dataset_name: Optional[str] = "custom_sandbox_dataset"


@app.post("/api/scenarios/{scenario_id}/chat")
def scenario_chat(scenario_id: str, payload: ChatRequest):
    try:
        reply = agent.chat_turn(
            scenario_id=scenario_id,
            user_message=payload.user_message,
            conversation_history=payload.history,
        )
        return reply
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat turn failed: {str(e)}")


@app.post("/api/scenarios/{scenario_id}/inject-custom-fault")
def inject_custom_fault(scenario_id: str, payload: CustomFaultRequest):
    try:
        from backend.scenarios.chaos_engine import inject_parametric_chaos
        res = inject_parametric_chaos(scenario_id, payload.chaos_mode, payload.params)
        profile = tool_run_quality_profile(scenario_id, dataset_type="active")
        impact = tool_simulate_downstream_impact(scenario_id)
        return {
            "result": res,
            "quality_profile": profile,
            "downstream_impact": impact["impacts"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/scenarios/{scenario_id}/guardrail-code")
def get_guardrail_code(scenario_id: str, guardrail_id: Optional[str] = None):
    from backend.tools.guardrail_codegen import generate_guardrail_code
    code = generate_guardrail_code(scenario_id, guardrail_id or "")
    return {
        "scenario_id": scenario_id,
        "guardrail_id": guardrail_id,
        "code": code,
        "code_snippets": code,
    }


@app.post("/api/custom/profile-csv")
def profile_custom_csv(payload: CsvProfileRequest):
    import io
    import csv
    try:
        reader = csv.DictReader(io.StringIO(payload.csv_text.strip()))
        rows = list(reader)
        if not rows:
            raise ValueError("CSV appears empty or has no header.")
        if len(rows) > 500:
            rows = rows[:500]  # Enforce safety bound

        fieldnames = reader.fieldnames or []
        first_col = fieldnames[0] if fieldnames else "id"
        values = [r.get(first_col) for r in rows if r.get(first_col)]
        unique_vals = set(values)
        duplicates = len(values) - len(unique_vals)

        return {
            "dataset_name": payload.dataset_name,
            "row_count": len(rows),
            "columns": fieldnames,
            "primary_key_candidate": first_col,
            "duplicate_count": duplicates,
            "sample_rows": rows[:5],
            "is_corrupted": duplicates > 0,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV profiling error: {str(e)}")

