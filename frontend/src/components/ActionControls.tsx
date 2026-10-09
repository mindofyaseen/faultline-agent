import React from 'react';
import {
  Flame,
  Play,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  FileText,
  Loader2,
  Bot,
  Zap,
  Code2,
  FileSpreadsheet,
} from 'lucide-react';
import { Scenario } from '../types';

interface ActionControlsProps {
  scenario: Scenario;
  isRunningDrill: boolean;
  isInjecting: boolean;
  isInvestigating: boolean;
  isReplaying: boolean;
  onRunFireDrill: () => void;
  onInjectFault: () => void;
  onInvestigate: () => void;
  onReplay: () => void;
  onReset: () => void;
  onOpenReport: () => void;
  onOpenCopilot: () => void;
  onOpenChaosStudio: () => void;
  onOpenGuardrailCode: () => void;
  onOpenCsvSandbox: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  scenario,
  isRunningDrill,
  isInjecting,
  isInvestigating,
  isReplaying,
  onRunFireDrill,
  onInjectFault,
  onInvestigate,
  onReplay,
  onReset,
  onOpenReport,
  onOpenCopilot,
  onOpenChaosStudio,
  onOpenGuardrailCode,
  onOpenCsvSandbox,
}) => {
  const isAnyLoading = isRunningDrill || isInjecting || isInvestigating || isReplaying;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#0d1629',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}
    >
      {/* Primary Action Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Signature Fire Drill Button */}
          <button
            className="btn btn-primary"
            onClick={onRunFireDrill}
            disabled={isAnyLoading}
            style={{ padding: '10px 22px', fontSize: '0.94rem' }}
          >
            {isRunningDrill ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Executing Fire Drill Rehearsal...</span>
              </>
            ) : (
              <>
                <Flame size={18} />
                <span>RUN PIPELINE FIRE DRILL</span>
              </>
            )}
          </button>

          {/* Step-by-step triggers */}
          <button
            className="btn btn-danger"
            onClick={onInjectFault}
            disabled={isAnyLoading || scenario.state === 'FAULT_INJECTED'}
          >
            {isInjecting ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
            <span>Inject Controlled Fault</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onInvestigate}
            disabled={isAnyLoading}
          >
            {isInvestigating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} style={{ color: '#06b6d4' }} />
            )}
            <span>Investigate with Bedrock</span>
          </button>

          <button
            className="btn btn-success"
            onClick={onReplay}
            disabled={isAnyLoading || scenario.state !== 'FAULT_INJECTED'}
          >
            {isReplaying ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            <span>Apply Guardrail & Replay</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={onOpenReport}
            title="View and export verified incident report"
          >
            <FileText size={16} />
            <span>Incident Report</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onReset}
            disabled={isAnyLoading}
            title="Reset sandbox state to baseline"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Advanced Enterprise Studio Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginRight: '4px',
          }}
        >
          Product Suites:
        </span>

        <button
          className="btn btn-secondary"
          onClick={onOpenCopilot}
          style={{
            fontSize: '0.82rem',
            padding: '5px 12px',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            color: '#c4b5fd',
          }}
        >
          <Bot size={15} style={{ color: '#a78bfa' }} />
          <span>Ask Bedrock Copilot</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenChaosStudio}
          style={{
            fontSize: '0.82rem',
            padding: '5px 12px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5',
          }}
        >
          <Zap size={15} style={{ color: '#f87171' }} />
          <span>Chaos Studio (Parametric)</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenGuardrailCode}
          style={{
            fontSize: '0.82rem',
            padding: '5px 12px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#93c5fd',
          }}
        >
          <Code2 size={15} style={{ color: '#60a5fa' }} />
          <span>Production Codegen (PySpark/dbt/Lambda)</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenCsvSandbox}
          style={{
            fontSize: '0.82rem',
            padding: '5px 12px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#6ee7b7',
          }}
        >
          <FileSpreadsheet size={15} style={{ color: '#34d399' }} />
          <span>Custom CSV Sandbox</span>
        </button>
      </div>
    </div>
  );
};
