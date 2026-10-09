import React, { useState } from 'react';
import { injectCustomFault } from '../api';
import { QualityProfile, DownstreamImpact } from '../types';

interface ChaosStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
  scenarioTitle: string;
  onChaosApplied: (profile: QualityProfile, impacts: DownstreamImpact[]) => void;
}

export const ChaosStudioModal: React.FC<ChaosStudioModalProps> = ({
  isOpen,
  onClose,
  scenarioId,
  scenarioTitle,
  onChaosApplied,
}) => {
  // Scenario specific parameters
  const isFintech = scenarioId.includes('fintech');
  const isHealthcare = scenarioId.includes('healthcare');
  const isEdtech = scenarioId.includes('edtech');

  const [fintechDupCount, setFintechDupCount] = useState<number>(3);
  const [healthcareDriftCount, setHealthcareDriftCount] = useState<number>(4);
  const [edtechDelayMinutes, setEdtechDelayMinutes] = useState<number>(45);
  const [edtechSchemaDrift, setEdtechSchemaDrift] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyChaos = async () => {
    setIsLoading(true);
    setFeedback(null);

    let chaosMode = 'default';
    let params: Record<string, any> = {};

    if (isFintech) {
      chaosMode = 'duplicate_burst';
      params = { duplicate_count: fintechDupCount };
    } else if (isHealthcare) {
      chaosMode = 'midnight_drift';
      params = { drift_count: healthcareDriftCount };
    } else if (isEdtech) {
      chaosMode = 'watermark_drift';
      params = {
        delay_minutes: edtechDelayMinutes,
        drift_schema: edtechSchemaDrift,
      };
    }

    try {
      const res = await injectCustomFault(scenarioId, chaosMode, params);
      onChaosApplied(res.quality_profile, res.downstream_impact);
      setFeedback(`Custom chaos injected successfully! Sandbox telemetry re-profiled.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback(`Error: ${err.message || 'Failed to inject custom chaos.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), 0 0 35px rgba(239, 68, 68, 0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              ⚡
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Parametric Chaos Studio
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Controlled Sandboxed Failure Rehearsal • {scenarioTitle}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.9rem' }}
          >
            ✕
          </button>
        </div>

        {/* Sliders and Controls */}
        <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isFintech && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fca5a5' }}>
                  Duplicate Ingestion Count:
                </label>
                <span
                  style={{
                    fontWeight: 700,
                    color: '#f87171',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {fintechDupCount} duplicate records
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={fintechDupCount}
                onChange={(e) => setFintechDupCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  lineHeight: '1.4',
                }}
              >
                Simulates upstream network retry storms and idempotency key drops in Kafka/SQS.
                Each duplicate adds phantom settlement amounts to ledger downstream.
              </div>
            </div>
          )}

          {isHealthcare && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fca5a5' }}>
                  Midnight UTC Shift Records:
                </label>
                <span
                  style={{
                    fontWeight: 700,
                    color: '#f87171',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {healthcareDriftCount} ambiguous records
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={healthcareDriftCount}
                onChange={(e) => setHealthcareDriftCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  lineHeight: '1.4',
                }}
              >
                Injects timezone-stripped ISO timestamps (e.g. 2026-10-10 21:00 without "Z").
                Causes records to roll across midnight into Oct 11, overloading clinic capacity.
              </div>
            </div>
          )}

          {isEdtech && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fca5a5' }}>
                    Late Arrival Latency:
                  </label>
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#f87171',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {edtechDelayMinutes} minutes late
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="5"
                  value={edtechDelayMinutes}
                  onChange={(e) => setEdtechDelayMinutes(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ef4444' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Streaming watermark is set to 15m. Any events arriving &gt; 15m late are dropped silently.
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <input
                  type="checkbox"
                  id="schema_drift"
                  checked={edtechSchemaDrift}
                  onChange={(e) => setEdtechSchemaDrift(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#ef4444', cursor: 'pointer' }}
                />
                <label htmlFor="schema_drift" style={{ fontSize: '0.85rem', cursor: 'pointer', color: '#e2e8f0' }}>
                  Enable Schema Drift (emit legacy <code>completed_at</code> instead of <code>completion_time</code>)
                </label>
              </div>
            </div>
          )}

          {feedback && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                backgroundColor: feedback.startsWith('Error')
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(16, 185, 129, 0.15)',
                color: feedback.startsWith('Error') ? '#fca5a5' : '#6ee7b7',
                border: `1px solid ${
                  feedback.startsWith('Error') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                }`,
              }}
            >
              {feedback}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={handleApplyChaos}
            disabled={isLoading}
            className="btn btn-danger"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isLoading && <div className="spinner" style={{ width: '14px', height: '14px' }} />}
            <span>Inject Chaos & Re-Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
