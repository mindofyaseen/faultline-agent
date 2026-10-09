import React from 'react';
import { Search, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { QualityProfile } from '../types';

interface EvidenceDrawerProps {
  qualityProfile: QualityProfile | null;
  scenarioId: string;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  qualityProfile,
  scenarioId,
}) => {
  if (!qualityProfile) {
    return (
      <div className="panel" style={{ textAlign: 'center', color: '#64748b' }}>
        No quality profile generated yet.
      </div>
    );
  }

  const { invariants_evaluated, metrics } = qualityProfile;

  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} style={{ color: '#06b6d4' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            Verified Measurements & Evidence
          </h3>
        </div>
        <div className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
          <span>Measured Facts</span>
        </div>
      </div>

      {/* Invariants Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invariant Check</th>
              <th>Status</th>
              <th>Observed Evidence</th>
              <th>Expected Rule</th>
            </tr>
          </thead>
          <tbody>
            {invariants_evaluated &&
              invariants_evaluated.map((inv) => (
                <tr key={inv.invariant_id}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                    {inv.name}
                  </td>
                  <td>
                    {inv.passed ? (
                      <span className="badge badge-emerald" style={{ padding: '2px 8px' }}>
                        <CheckCircle2 size={12} /> PASS
                      </span>
                    ) : (
                      <span className="badge badge-hazard" style={{ padding: '2px 8px' }}>
                        <XCircle size={12} /> FAIL
                      </span>
                    )}
                  </td>
                  <td style={{ color: inv.passed ? '#94a3b8' : '#fca5a5', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {inv.observed}
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    {inv.expected}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Specific Flagged Records Drawer */}
        <div style={{ marginTop: '16px', background: '#080d1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, textTransform: 'uppercase' }}>
            <Eye size={14} /> Flagged Record Citations
          </div>

          {scenarioId === 'scenario_fintech' && metrics.duplicate_record_ids && (
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div>
                <strong>Duplicate Transaction IDs:</strong>{' '}
                {metrics.duplicate_record_ids.length > 0 ? (
                  metrics.duplicate_record_ids.map((id: string) => (
                    <span key={id} className="badge badge-hazard" style={{ margin: '2px 4px', textTransform: 'none' }}>
                      {id}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#10b981' }}>None detected</span>
                )}
              </div>
              <div style={{ marginTop: '6px', color: '#94a3b8' }}>
                Raw Sum: <strong>${metrics.raw_sum?.toFixed(2)}</strong> | Reconciled Ledger: <strong>${metrics.unique_sum?.toFixed(2)}</strong> | Variance:{' '}
                <strong style={{ color: metrics.discrepancy > 0 ? '#ef4444' : '#10b981' }}>
                  +${metrics.discrepancy?.toFixed(2)}
                </strong>
              </div>
            </div>
          )}

          {scenarioId === 'scenario_healthcare' && metrics.ambiguous_record_ids && (
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div>
                <strong>Ambiguous Timezone Appointments:</strong>{' '}
                {metrics.ambiguous_record_ids.length > 0 ? (
                  metrics.ambiguous_record_ids.map((id: string) => (
                    <span key={id} className="badge badge-hazard" style={{ margin: '2px 4px', textTransform: 'none' }}>
                      {id}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#10b981' }}>None detected</span>
                )}
              </div>
              <div style={{ marginTop: '6px', color: '#94a3b8' }}>
                Oct 10 Volume: <strong>{metrics.oct_10_count}</strong> | Oct 11 Volume: <strong>{metrics.oct_11_count}</strong> (Max Staffing Threshold: {metrics.clinic_threshold})
              </div>
            </div>
          )}

          {scenarioId === 'scenario_edtech' && metrics.dropped_student_ids && (
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div>
                <strong>Dropped / Delayed Students:</strong>{' '}
                {metrics.dropped_student_ids.length > 0 ? (
                  metrics.dropped_student_ids.map((id: string) => (
                    <span key={id} className="badge badge-hazard" style={{ margin: '2px 4px', textTransform: 'none' }}>
                      {id}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#10b981' }}>None detected</span>
                )}
              </div>
              <div style={{ marginTop: '6px', color: '#94a3b8' }}>
                Completion Rate: <strong>{metrics.completion_rate_pct}%</strong> ({metrics.processed_count}/{metrics.total_enrolled})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
