import React, { useState, useEffect } from 'react';
import {
  fetchHealth,
  fetchScenarios,
  fetchScenarioDetail,
  resetScenario,
  injectFault,
  runInvestigation,
  replayScenario,
  exportReport,
} from './api';
import {
  Scenario,
  QualityProfile,
  DownstreamImpact,
  ToolTrace,
  ReplayResult,
} from './types';
import { Header } from './components/Header';
import { ScenarioCards } from './components/ScenarioCards';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ActionControls } from './components/ActionControls';
import { InvestigationFeed } from './components/InvestigationFeed';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { DownstreamImpactView } from './components/DownstreamImpactView';
import { BeforeAfterReplay } from './components/BeforeAfterReplay';
import { ReportModal } from './components/ReportModal';
import { CopilotChat } from './components/CopilotChat';
import { ChaosStudioModal } from './components/ChaosStudioModal';
import { GuardrailCodeModal } from './components/GuardrailCodeModal';
import { CustomCsvModal } from './components/CustomCsvModal';
import { VisualTelemetryGauges } from './components/VisualTelemetryGauges';

export const App: React.FC = () => {
  const [healthData, setHealthData] = useState<{
    aws_region?: string;
    model_id?: string;
    engine?: string;
  }>({});
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario_fintech');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [qualityProfile, setQualityProfile] = useState<QualityProfile | null>(null);
  const [downstreamImpacts, setDownstreamImpacts] = useState<DownstreamImpact[]>([]);
  const [toolTraces, setToolTraces] = useState<ToolTrace[]>([]);
  const [synthesis, setSynthesis] = useState<string>('');
  const [replayResult, setReplayResult] = useState<ReplayResult | null>(null);

  // Loading states
  const [isRunningDrill, setIsRunningDrill] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  // Modals & Panels
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [reportJson, setReportJson] = useState<any>(null);

  // Enterprise Feature Modals
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isChaosStudioOpen, setIsChaosStudioOpen] = useState(false);
  const [isGuardrailCodeOpen, setIsGuardrailCodeOpen] = useState(false);
  const [isCsvSandboxOpen, setIsCsvSandboxOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadHealthAndScenarios();
  }, []);

  // When scenario changes, load its details
  useEffect(() => {
    if (selectedScenarioId) {
      loadScenarioDetails(selectedScenarioId);
    }
  }, [selectedScenarioId]);

  const loadHealthAndScenarios = async () => {
    try {
      const [h, scList] = await Promise.all([fetchHealth(), fetchScenarios()]);
      setHealthData(h);
      setScenarios(scList);
      if (scList.length > 0 && !selectedScenarioId) {
        setSelectedScenarioId(scList[0].id);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const loadScenarioDetails = async (id: string) => {
    try {
      const data = await fetchScenarioDetail(id);
      setCurrentScenario(data.scenario);
      setQualityProfile(data.quality_profile);
      setDownstreamImpacts(data.downstream_impact);
      setReplayResult(null);
    } catch (err) {
      console.error('Error loading scenario detail:', err);
    }
  };

  // --------------------------------------------------------------------------
  // The Signature Experience: "The Pipeline Fire Drill"
  // --------------------------------------------------------------------------
  const handleRunFireDrill = async () => {
    if (!currentScenario) return;
    setIsRunningDrill(true);
    setToolTraces([]);
    setSynthesis('Fire Drill initiated. Resetting sandbox to fresh state...');

    try {
      // 1. Reset
      await resetScenario(selectedScenarioId);

      // 2. Inject fault
      setSynthesis('Step 1/4: Injecting controlled failure into isolated sandbox...');
      const faultType = currentScenario.permitted_faults[0];
      const faultRes = await injectFault(selectedScenarioId, faultType);
      setQualityProfile(faultRes.quality_profile);
      setDownstreamImpacts(faultRes.downstream_impact);
      await loadScenarioDetails(selectedScenarioId);

      // 3. Invoke Bedrock Agent to investigate
      setSynthesis('Step 2/4: Invoking Amazon Bedrock agent to inspect evidence...');
      const agentRes = await runInvestigation(selectedScenarioId);
      setToolTraces(agentRes.tool_traces || []);
      setSynthesis(agentRes.synthesis || 'Investigation completed.');

      // 4. Select Guardrail & Replay
      setSynthesis('Step 3/4: Applying approved guardrail remediation and replaying pipeline...');
      const guardrail = currentScenario.available_guardrails[0];
      if (guardrail) {
        const replayRes = await replayScenario(selectedScenarioId, guardrail.id);
        setReplayResult(replayRes);
      }

      // 5. Finalize state
      await loadScenarioDetails(selectedScenarioId);
      setSynthesis((prev) => `${prev}\n\n[FIRE DRILL COMPLETE] Remediation verified in sandbox without modifying production data.`);
    } catch (err: any) {
      setSynthesis(`Fire Drill encountered an issue: ${err.message}`);
    } finally {
      setIsRunningDrill(false);
    }
  };

  // Individual triggers
  const handleInjectFault = async () => {
    if (!currentScenario) return;
    setIsInjecting(true);
    try {
      const faultType = currentScenario.permitted_faults[0];
      const res = await injectFault(selectedScenarioId, faultType);
      setQualityProfile(res.quality_profile);
      setDownstreamImpacts(res.downstream_impact);
      await loadScenarioDetails(selectedScenarioId);
    } catch (err: any) {
      alert(`Inject fault failed: ${err.message}`);
    } finally {
      setIsInjecting(false);
    }
  };

  const handleInvestigate = async () => {
    setIsInvestigating(true);
    try {
      const res = await runInvestigation(selectedScenarioId);
      setToolTraces(res.tool_traces || []);
      setSynthesis(res.synthesis || '');
    } catch (err: any) {
      alert(`Investigation failed: ${err.message}`);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleReplay = async () => {
    if (!currentScenario || !currentScenario.available_guardrails[0]) return;
    setIsReplaying(true);
    try {
      const guardrailId = currentScenario.available_guardrails[0].id;
      const res = await replayScenario(selectedScenarioId, guardrailId);
      setReplayResult(res);
      await loadScenarioDetails(selectedScenarioId);
    } catch (err: any) {
      alert(`Replay failed: ${err.message}`);
    } finally {
      setIsReplaying(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetScenario(selectedScenarioId);
      await loadScenarioDetails(selectedScenarioId);
      setToolTraces([]);
      setSynthesis('');
      setReplayResult(null);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  const handleOpenReport = async () => {
    try {
      const [mdRes, jsonRes] = await Promise.all([
        exportReport(selectedScenarioId, 'markdown'),
        exportReport(selectedScenarioId, 'json'),
      ]);
      setReportMarkdown(mdRes.content);
      setReportJson(jsonRes.content);
      setIsReportOpen(true);
    } catch (err: any) {
      alert(`Report export failed: ${err.message}`);
    }
  };

  const handleChaosApplied = (profile: QualityProfile, impacts: DownstreamImpact[]) => {
    setQualityProfile(profile);
    setDownstreamImpacts(impacts);
    loadScenarioDetails(selectedScenarioId);
  };

  return (
    <div className="app-container">
      {/* Header bar */}
      <Header
        awsRegion={healthData.aws_region || 'us-east-1'}
        modelId={healthData.model_id || 'amazon.nova-lite-v1:0'}
        engine={healthData.engine || 'Amazon Bedrock Converse API'}
      />

      {/* Rehearsal Scenarios Selection Cards */}
      <ScenarioCards
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={setSelectedScenarioId}
      />

      {currentScenario && (
        <>
          {/* Action Bar & Product Suite Controls */}
          <ActionControls
            scenario={currentScenario}
            isRunningDrill={isRunningDrill}
            isInjecting={isInjecting}
            isInvestigating={isInvestigating}
            isReplaying={isReplaying}
            onRunFireDrill={handleRunFireDrill}
            onInjectFault={handleInjectFault}
            onInvestigate={handleInvestigate}
            onReplay={handleReplay}
            onReset={handleReset}
            onOpenReport={handleOpenReport}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onOpenChaosStudio={() => setIsChaosStudioOpen(true)}
            onOpenGuardrailCode={() => setIsGuardrailCodeOpen(true)}
            onOpenCsvSandbox={() => setIsCsvSandboxOpen(true)}
          />

          {/* Real-Time Telemetry & Downstream Boundary Gauges */}
          <VisualTelemetryGauges
            scenarioId={selectedScenarioId}
            qualityProfile={qualityProfile}
            impacts={downstreamImpacts}
          />

          {/* Pipeline Topology Visualizer */}
          <PipelineVisualizer
            stages={currentScenario.stages}
            scenarioTitle={currentScenario.title}
            state={currentScenario.state}
          />

          {/* Investigation Grid: Live Agent Feed & Evidence Drawer */}
          <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
            <InvestigationFeed
              toolTraces={toolTraces}
              synthesis={synthesis}
              isInvestigating={isInvestigating || isRunningDrill}
              modelId={healthData.model_id || 'amazon.nova-lite-v1:0'}
            />

            <EvidenceDrawer
              qualityProfile={qualityProfile}
              scenarioId={selectedScenarioId}
            />
          </div>

          {/* Downstream Impact Panel */}
          <DownstreamImpactView impacts={downstreamImpacts} />

          {/* Before vs After Replay Verification */}
          <BeforeAfterReplay replayResult={replayResult} />
        </>
      )}

      {/* Exportable Incident Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportMarkdown={reportMarkdown}
        reportJson={reportJson}
      />

      {/* AI Copilot Drawer Modal */}
      {currentScenario && (
        <CopilotChat
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          scenarioId={selectedScenarioId}
          scenarioTitle={currentScenario.title}
        />
      )}

      {/* Parametric Chaos Studio Modal */}
      {currentScenario && (
        <ChaosStudioModal
          isOpen={isChaosStudioOpen}
          onClose={() => setIsChaosStudioOpen(false)}
          scenarioId={selectedScenarioId}
          scenarioTitle={currentScenario.title}
          onChaosApplied={handleChaosApplied}
        />
      )}

      {/* Production Guardrail Code Modal */}
      {currentScenario && (
        <GuardrailCodeModal
          isOpen={isGuardrailCodeOpen}
          onClose={() => setIsGuardrailCodeOpen(false)}
          scenarioId={selectedScenarioId}
          scenarioTitle={currentScenario.title}
          guardrailId={currentScenario.available_guardrails[0]?.id}
          guardrailName={currentScenario.available_guardrails[0]?.name}
        />
      )}

      {/* Custom CSV Dataset Profiler Modal */}
      <CustomCsvModal
        isOpen={isCsvSandboxOpen}
        onClose={() => setIsCsvSandboxOpen(false)}
      />
    </div>
  );
};
