"""
Base models and definitions for FAULTLINE scenarios.
Core Principle: EVIDENCE, NOT VIBES.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class PipelineStage(BaseModel):
    id: str
    name: str
    description: str
    dependencies: List[str] = Field(default_factory=list)
    status: str = "IDLE"  # IDLE, HEALTHY, FAILED, REMEDIATED
    runtime_ms: int = 0


class InvariantRule(BaseModel):
    id: str
    name: str
    expression: str
    severity: str = "CRITICAL"  # CRITICAL, WARNING
    description: str


class EvidenceItem(BaseModel):
    evidence_id: str
    assertion_id: str
    status: str  # CONFIRMED, LIKELY, UNVERIFIED
    record_ids: List[str]
    observed_value: Any
    expected_value: Any
    message: str
    measured_fact: bool = True  # Distinguish facts from model hypotheses


class DownstreamImpact(BaseModel):
    metric_name: str
    baseline_value: Any
    corrupted_value: Any
    remediated_value: Optional[Any] = None
    variance_display: str
    is_hypothesis: bool = False
    business_consequence: str


class Guardrail(BaseModel):
    id: str
    name: str
    strategy: str
    description: str
    code_summary: str


class ScenarioDefinition(BaseModel):
    id: str
    title: str
    tagline: str
    domain: str
    description: str
    stages: List[PipelineStage]
    invariants: List[InvariantRule]
    permitted_faults: List[str]
    available_guardrails: List[Guardrail]
    baseline_records: List[Dict[str, Any]]
    fault_records: List[Dict[str, Any]]
    active_records: List[Dict[str, Any]] = Field(default_factory=list)
    state: str = "BASELINE"  # BASELINE, FAULT_INJECTED, REMEDIATED
    active_guardrail_id: Optional[str] = None
