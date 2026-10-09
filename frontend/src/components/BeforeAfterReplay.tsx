import React from 'react';
import { ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';
import { ReplayResult } from '../types';

interface BeforeAfterReplayProps {
  replayResult: ReplayResult | null;
}

export const BeforeAfterReplay: React.FC<BeforeAfterReplayProps> = ({
  replayResult,
}) => {
  if (!replayResult) {
    return (
      <div className="panel" style={{ textAlign: 'center', color: '#64748b' }}>
        <p>No replay verification executed yet. Click <strong>Apply Guardrail & Replay</strong> or <strong>RUN FIRE DRILL</strong> to test remediation.</p>
      </div>
    );
  }

  const {
    guardrail_applied,
    remediation_status,
    assertions_executed,
    assertions_passed,
    assertions_failed,
    invariants_result,
    remaining_risks,
  } = replayResult;

  const isSuccess = remediation_status === 'VERIFIED_SUCCESS';

  return (
    <div className={`panel ${isSuccess ? 'panel-cyan' : 'panel-hazard'}`} style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeftRight size={18} style={{ color: '#06b6d4' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
            Before vs. After Replay Verification
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-cyan" style={{ textTransform: 'none' }}>
            Guardrail: {guardrail_applied}
          </span>
          <span className={`badge ${isSuccess ? 'badge-emerald' : 'badge-hazard'}`}>
            {isSuccess ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {remediation_status}
          </span>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '16px' }}>
        {/* Assertions Pass Score */}
        <div style={{ background: '#080d1a', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Invariant Assertions Status
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isSuccess ? '#34d399' : '#f87171' }}>
            {assertions_passed} / {assertions_executed} PASSED
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            {assertions_failed === 0 ? 'All pipeline invariants restored to 100% compliance.' : `${assertions_failed} invariant still failing.`}
          </div>
        </div>

        {/* Residual Risk Analysis */}
        <div style={{ background: '#080d1a', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Remaining Architectural Risks
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
            {remaining_risks &&
              remaining_risks.map((risk, i) => <li key={i}>{risk}</li>)}
          </ul>
        </div>
      </div>

      {/* Invariants Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Invariant Rule</th>
            <th>Verification Status</th>
            <th>Replayed Measurement</th>
          </tr>
        </thead>
        <tbody>
          {invariants_result &&
            invariants_result.map((inv) => (
              <tr key={inv.invariant_id}>
                <td style={{ fontWeight: 600, color: '#f8fafc' }}>{inv.name}</td>
                <td>
                  {inv.passed ? (
                    <span className="badge badge-emerald" style={{ padding: '2px 8px' }}>
                      <CheckCircle2 size={12} /> RESTORED
                    </span>
                  ) : (
                    <span className="badge badge-hazard" style={{ padding: '2px 8px' }}>
                      <XCircle size={12} /> STILL FAILED
                    </span>
                  )}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#a7f3d0' }}>
                  {inv.observed}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
