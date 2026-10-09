import {
  Scenario,
  QualityProfile,
  DownstreamImpact,
  InvestigationResult,
  ReplayResult,
} from './types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export async function fetchHealth(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${API_BASE}/api/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  const data = await res.json();
  return data.scenarios;
}

export async function fetchScenarioDetail(scenarioId: string): Promise<{
  scenario: Scenario;
  quality_profile: QualityProfile;
  downstream_impact: DownstreamImpact[];
}> {
  const res = await fetch(`${API_BASE}/api/scenarios/${scenarioId}`);
  if (!res.ok) throw new Error(`Failed to fetch scenario ${scenarioId}`);
  return res.json();
}

export async function resetScenario(scenarioId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/scenarios/${scenarioId}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset scenario');
}

export async function injectFault(
  scenarioId: string,
  faultType: string
): Promise<{
  result: Record<string, any>;
  quality_profile: QualityProfile;
  downstream_impact: DownstreamImpact[];
}> {
  const res = await fetch(`${API_BASE}/api/scenarios/${scenarioId}/inject-fault`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fault_type: faultType }),
  });
  if (!res.ok) throw new Error('Failed to inject fault');
  return res.json();
}

export async function runInvestigation(
  scenarioId: string,
  userPrompt?: string
): Promise<InvestigationResult> {
  const res = await fetch(`${API_BASE}/api/scenarios/${scenarioId}/investigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_prompt: userPrompt }),
  });
  if (!res.ok) throw new Error('Failed to run agent investigation');
  return res.json();
}

export async function applyGuardrail(
  scenarioId: string,
  guardrailId: string
): Promise<{
  result: Record<string, any>;
  quality_profile: QualityProfile;
  downstream_impact: DownstreamImpact[];
}> {
  const res = await fetch(`${API_BASE}/api/scenarios/${scenarioId}/guardrail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guardrail_id: guardrailId }),
  });
  if (!res.ok) throw new Error('Failed to apply guardrail');
  return res.json();
}

export async function replayScenario(
  scenarioId: string,
  guardrailId: string
): Promise<ReplayResult> {
  const res = await fetch(`${API_BASE}/api/scenarios/${scenarioId}/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guardrail_id: guardrailId }),
  });
  if (!res.ok) throw new Error('Failed to replay scenario');
  return res.json();
}

export async function exportReport(
  scenarioId: string,
  format: 'markdown' | 'json' = 'markdown'
): Promise<{ format: string; content: any }> {
  const res = await fetch(
    `${API_BASE}/api/scenarios/${scenarioId}/report?format=${format}`
  );
  if (!res.ok) throw new Error('Failed to export report');
  return res.json();
}
