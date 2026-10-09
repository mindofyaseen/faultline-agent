import React from 'react';
import { TrendingDown } from 'lucide-react';
import { DownstreamImpact } from '../types';

interface DownstreamImpactViewProps {
  impacts: DownstreamImpact[];
}

export const DownstreamImpactView: React.FC<DownstreamImpactViewProps> = ({
  impacts,
}) => {
  return (
    <div className="panel" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingDown size={18} style={{ color: '#ef4444' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            Downstream Impact & Risk Quantification
          </h3>
        </div>
        <div className="badge badge-hazard" style={{ fontSize: '0.7rem' }}>
          <span>Business Risk</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {impacts &&
          impacts.map((imp, idx) => (
            <div
              key={idx}
              style={{
                background: '#090e1c',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                  {imp.metric_name}
                </span>
                <span
                  className={`badge ${imp.is_hypothesis ? 'badge-amber' : 'badge-hazard'}`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {imp.is_hypothesis ? 'Hypothesis' : 'Measured Fact'}
                </span>
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
                {imp.variance_display}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', marginTop: '6px' }}>
                <strong style={{ color: '#cbd5e1' }}>Consequence:</strong> {imp.business_consequence}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.74rem', color: '#64748b' }}>
                <span>Baseline: <strong style={{ color: '#94a3b8' }}>{String(imp.baseline_value)}</strong></span>
                <span>Corrupted: <strong style={{ color: '#f87171' }}>{String(imp.corrupted_value)}</strong></span>
                {imp.remediated_value && (
                  <span>Remediated: <strong style={{ color: '#34d399' }}>{String(imp.remediated_value)}</strong></span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
