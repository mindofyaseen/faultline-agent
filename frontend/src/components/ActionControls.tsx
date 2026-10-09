import React from 'react';
import { Flame, Play, ShieldAlert, Sparkles, RotateCcw, FileText, Loader2 } from 'lucide-react';
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
}) => {
  const isAnyLoading = isRunningDrill || isInjecting || isInvestigating || isReplaying;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0d1629',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '24px',
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
          {isInvestigating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} style={{ color: '#06b6d4' }} />}
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
  );
};
