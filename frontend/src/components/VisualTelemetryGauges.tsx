import React from 'react';
import { QualityProfile, DownstreamImpact } from '../types';

interface VisualTelemetryGaugesProps {
  scenarioId: string;
  qualityProfile: QualityProfile | null;
  impacts: DownstreamImpact[];
}

export const VisualTelemetryGauges: React.FC<VisualTelemetryGaugesProps> = ({
  scenarioId,
  qualityProfile,
  impacts,
}) => {
  const isFintech = scenarioId.includes('fintech');
  const isHealthcare = scenarioId.includes('healthcare');
  const isEdtech = scenarioId.includes('edtech');

  const hasAnomalies =
    qualityProfile !== null &&
    (!qualityProfile.all_invariants_passed ||
      (qualityProfile.duplicate_count ?? 0) > 0 ||
      (qualityProfile.ambiguous_count ?? 0) > 0 ||
      (qualityProfile.dropped_count ?? 0) > 0 ||
      (qualityProfile.schema_mismatch_count ?? 0) > 0);

  const totalRecords = qualityProfile?.record_count ?? 0;
  const duplicateCount = qualityProfile?.duplicate_count ?? 0;
  const uniqueCount = Math.max(totalRecords - duplicateCount, 0);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📈</span>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            Real-Time Telemetry & Downstream Boundary Gauges
          </h3>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            padding: '3px 10px',
            borderRadius: '999px',
            fontFamily: 'monospace',
            backgroundColor: hasAnomalies
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(16, 185, 129, 0.15)',
            color: hasAnomalies ? '#f87171' : '#34d399',
            border: `1px solid ${
              hasAnomalies ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
            }`,
          }}
        >
          {hasAnomalies ? '⚠️ THRESHOLD BREACH DETECTED' : '✓ BOUNDARIES WITHIN SAFE SPEC'}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Metric 1: Record Integrity & Duplication Gauge */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            <span>Unique Key Integrity</span>
            <span style={{ fontWeight: 600, color: hasAnomalies ? '#f87171' : '#34d399' }}>
              {qualityProfile
                ? `${uniqueCount} / ${totalRecords} Records`
                : 'Evaluating...'}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: totalRecords > 0 ? `${(uniqueCount / totalRecords) * 100}%` : '100%',
                backgroundColor: hasAnomalies ? '#ef4444' : '#10b981',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div
            style={{
              marginTop: '8px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Duplicates: {duplicateCount}</span>
            <span>All Invariants: {qualityProfile?.all_invariants_passed ? 'PASS' : 'FAIL'}</span>
          </div>
        </div>

        {/* Metric 2: Domain Specific Downstream Variance Gauge */}
        {isFintech && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '6px',
              }}
            >
              <span>Ledger Revenue Variance</span>
              <span
                style={{
                  fontWeight: 700,
                  color: hasAnomalies ? '#f87171' : '#34d399',
                  fontFamily: 'monospace',
                }}
              >
                {hasAnomalies ? '+$470.00 Phantom Drift' : '±$0.00 Balanced'}
              </span>
            </div>

            <div
              style={{
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: hasAnomalies ? '100%' : '85%',
                  maxWidth: '100%',
                  backgroundColor: hasAnomalies ? '#f59e0b' : '#3b82f6',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div
              style={{
                marginTop: '8px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Baseline: $2,780.00</span>
              <span>Ingested: {hasAnomalies ? '$3,250.00' : '$2,780.00'}</span>
            </div>
          </div>
        )}

        {isHealthcare && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '6px',
              }}
            >
              <span>Oct 11 Clinic Bed Capacity</span>
              <span
                style={{
                  fontWeight: 700,
                  color: hasAnomalies ? '#ef4444' : '#34d399',
                  fontFamily: 'monospace',
                }}
              >
                {hasAnomalies ? '18 / 16 (OVERCAPACITY)' : '14 / 16 Normal'}
              </span>
            </div>

            <div
              style={{
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: hasAnomalies ? '100%' : '87.5%',
                  backgroundColor: hasAnomalies ? '#ef4444' : '#10b981',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div
              style={{
                marginTop: '8px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Threshold: 16 Patients</span>
              <span>Midnight Roll: {hasAnomalies ? '+4 Patients' : '0 Roll'}</span>
            </div>
          </div>
        )}

        {isEdtech && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '6px',
              }}
            >
              <span>Course Completion Rate</span>
              <span
                style={{
                  fontWeight: 700,
                  color: hasAnomalies ? '#f59e0b' : '#34d399',
                  fontFamily: 'monospace',
                }}
              >
                {hasAnomalies ? '75% (Drop below SLA)' : '95% Healthy'}
              </span>
            </div>

            <div
              style={{
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: hasAnomalies ? '75%' : '95%',
                  backgroundColor: hasAnomalies ? '#f59e0b' : '#10b981',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            <div
              style={{
                marginTop: '8px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>SLA Target: ≥ 90%</span>
              <span>Watermark Drop: {hasAnomalies ? '4 Events Dropped' : '0 Dropped'}</span>
            </div>
          </div>
        )}

        {/* Metric 3: Downstream Impact Gauges */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            <span>Downstream Boundaries Evaluated</span>
            <span
              style={{
                fontWeight: 600,
                color: impacts.length > 0 ? '#f87171' : '#34d399',
              }}
            >
              {impacts.length} Metrics Monitored
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {impacts.map((imp, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
                title={imp.business_consequence}
              >
                🚨 {imp.metric_name}: {imp.variance_display}
              </span>
            ))}
            {impacts.length === 0 && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#6ee7b7',
                }}
              >
                ✓ All consumers operational
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
