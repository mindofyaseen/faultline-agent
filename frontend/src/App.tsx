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
import { Navbar, NavTab } from './components/Navbar';
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
import { Footer } from './components/Footer';

// Pages
import { FeaturesPage } from './components/pages/FeaturesPage';
import { ArchitecturePage } from './components/pages/ArchitecturePage';
import { RoiCalculatorPage } from './components/pages/RoiCalculatorPage';
import { ApiDocsPage } from './components/pages/ApiDocsPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('workbench');
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
      {/* Sticky Startup Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        awsRegion={healthData.aws_region || 'us-east-1'}
        isHealthy={currentScenario?.state !== 'FAULT_INJECTED'}
        onTriggerFireDrill={handleRunFireDrill}
      />

      {/* VIEW: WORKBENCH */}
      {activeTab === 'workbench' && (
        <>
          {/* Hero Banner with Startup Badges */}
          <div
            style={{
              padding: '28px 32px',
              background: 'linear-gradient(135deg, rgba(12, 19, 36, 0.8), rgba(6, 10, 20, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#38bdf8',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  🚀 AWS Builder Center Challenge Entry
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Model: {healthData.model_id || 'amazon.nova-lite-v1:0'}
                </span>
              </div>
              <h1
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '-0.02em',
                  marginBottom: '6px',
                }}
              >
                Your pipeline is green. But is your data telling the truth?
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '720px', lineHeight: '1.5' }}>
                Rehearse silent data corruption, duplicate settlement mirages, and temporal timezone
                shifts in an isolated 3D WebGL laboratory before bad data pollutes executive dashboards.
              </p>
            </div>

            {/* Ecosystem Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ecosystem Compatibility
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Snowflake', 'AWS Glue', 'dbt', 'Airflow', 'Datadog'].map((tool, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

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

              {/* Pipeline Topology Visualizer with 3D Holographic / 2D Toggle */}
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
        </>
      )}

      {/* VIEW: PRODUCT SUITES */}
      {activeTab === 'features' && (
        <FeaturesPage onLaunchWorkbench={() => setActiveTab('workbench')} />
      )}

      {/* VIEW: AWS ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <ArchitecturePage onLaunchWorkbench={() => setActiveTab('workbench')} />
      )}

      {/* VIEW: ROI CALCULATOR */}
      {activeTab === 'calculator' && (
        <RoiCalculatorPage onLaunchWorkbench={() => setActiveTab('workbench')} />
      )}

      {/* VIEW: API DOCS & CI/CD */}
      {activeTab === 'docs' && <ApiDocsPage />}

      {/* Enterprise Startup Footer */}
      <Footer onSelectTab={(tab) => setActiveTab(tab)} />

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
