export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  status: 'IDLE' | 'HEALTHY' | 'FAILED' | 'WARNING' | 'REMEDIATED';
  runtime_ms: number;
}

export interface InvariantRule {
  id: string;
  name: string;
  expression: string;
  severity: 'CRITICAL' | 'WARNING';
  description: string;
}

export interface Guardrail {
  id: string;
  name: string;
  strategy: string;
  description: string;
  code_summary: string;
}

export interface Scenario {
  id: string;
  title: string;
  tagline: string;
  domain: string;
  description: string;
  state: 'BASELINE' | 'FAULT_INJECTED' | 'REMEDIATED';
  stages: PipelineStage[];
  invariants: InvariantRule[];
  permitted_faults: string[];
  available_guardrails: Guardrail[];
  active_guardrail_id?: string;
}

export interface InvariantEvaluation {
  invariant_id: string;
  name: string;
  passed: boolean;
  observed: string;
  expected: string;
}

export interface QualityProfile {
  scenario_id: string;
  dataset_type: string;
  record_count: number;
  duplicate_count?: number;
  ambiguous_count?: number;
  dropped_count?: number;
  schema_mismatch_count?: number;
  metrics: Record<string, any>;
  invariants_evaluated: InvariantEvaluation[];
  all_invariants_passed: boolean;
}

export interface DownstreamImpact {
  metric_name: string;
  baseline_value: any;
  corrupted_value: any;
  remediated_value?: any;
  variance_display: string;
  is_hypothesis: boolean;
  business_consequence: string;
}

export interface EvidenceItem {
  evidence_id: string;
  assertion_id: string;
  status: 'CONFIRMED' | 'LIKELY' | 'UNVERIFIED';
  record_ids: string[];
  observed_value: any;
  expected_value: any;
  message: string;
  measured_fact: boolean;
}

export interface ToolTrace {
  round: number;
  tool_use_id?: string;
  tool_name: string;
  input: Record<string, any>;
  status: 'success' | 'error';
  output: Record<string, any>;
}

export interface InvestigationResult {
  scenario_id: string;
  model_id: string;
  rounds_completed: number;
  tool_calls_executed: number;
  tool_traces: ToolTrace[];
  synthesis: string;
  status: string;
  engine: string;
  warning?: string;
}

export interface ReplayResult {
  scenario_id: string;
  guardrail_applied: string;
  remediation_status: string;
  assertions_executed: number;
  assertions_passed: number;
  assertions_failed: number;
  before_metrics: Record<string, any>;
  after_metrics: Record<string, any>;
  invariants_result: InvariantEvaluation[];
  remaining_risks: string[];
}
