import React, { useState } from 'react';

interface RoiCalculatorPageProps {
  onLaunchWorkbench: () => void;
}

export const RoiCalculatorPage: React.FC<RoiCalculatorPageProps> = ({ onLaunchWorkbench }) => {
  const [dailyRecords, setDailyRecords] = useState<number>(5000000); // 5M records
  const [incidentCount, setIncidentCount] = useState<number>(4); // 4 silent incidents / yr
  const [avgLossPerIncident, setAvgLossPerIncident] = useState<number>(35000); // $35k per silent issue

  // Calculations
  const annualSilentOutageCost = incidentCount * avgLossPerIncident;
  const engineeringHoursLost = incidentCount * 65; // ~65 engineering hours per silent pipeline bug
  const engineeringCostSaved = engineeringHoursLost * 95; // $95/hr senior engineer blended rate
  const totalAnnualRisk = annualSilentOutageCost + engineeringCostSaved;

  // FAULTLINE AWS serverless cost:
  // ~200 fire drills/year * $0.0004 = $0.08 Bedrock + Lambda
  const faultlineAnnualCost = 24.0; // ~$24/yr total AWS cost
  const netSavings = totalAnnualRisk - faultlineAnnualCost;
  const roiPercentage = Math.round((netSavings / faultlineAnnualCost) * 100);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '44px', paddingTop: '10px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}
        >
          <span>💰 Data Downtime Business Case</span>
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#f8fafc',
            marginBottom: '14px',
            lineHeight: '1.2',
          }}
        >
          Silent Pipeline Failure ROI Calculator
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#94a3b8',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          Gartner estimates that poor data quality costs organizations an average of $12.9 million
          annually. Calculate your exact financial risk from silent pipeline drift.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '32px',
          marginBottom: '48px',
        }}
      >
        {/* Sliders Input Panel */}
        <div
          style={{
            backgroundColor: 'rgba(12, 19, 36, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            Pipeline Parameters
          </h3>

          {/* Slider 1 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                Daily Pipeline Record Volume:
              </label>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                {(dailyRecords / 1000000).toFixed(1)}M records/day
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="50000000"
              step="500000"
              value={dailyRecords}
              onChange={(e) => setDailyRecords(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Slider 2 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                Silent Drift Incidents Per Year:
              </label>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>
                {incidentCount} incidents / year
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={incidentCount}
              onChange={(e) => setIncidentCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ef4444' }}
            />
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
              Includes duplicate settlements, timezone drift, schema mismatch, or late arrival drops.
            </div>
          </div>

          {/* Slider 3 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                Average Direct Business Exposure:
              </label>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>
                ${avgLossPerIncident.toLocaleString()} / incident
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={avgLossPerIncident}
              onChange={(e) => setAvgLossPerIncident(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
              Overpaid payouts, customer churn, audit compliance fines, or downstream reporting errors.
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(12, 19, 36, 0.95), rgba(8, 14, 28, 0.95))',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Annual Financial Impact
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontWeight: 700,
                }}
              >
                {roiPercentage.toLocaleString()}% ROI
              </span>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Annual Risk Prevented:</div>
              <div
                style={{
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  color: '#34d399',
                  fontFamily: 'monospace',
                  letterSpacing: '-0.02em',
                }}
              >
                ${totalAnnualRisk.toLocaleString()}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Direct Ledger Loss Saved</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                  ${annualSilentOutageCost.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Engineering Hours Saved</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
                  {engineeringHoursLost} hrs/yr (${engineeringCostSaved.toLocaleString()})
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>FAULTLINE Serverless Cost</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a78bfa' }}>
                  ~${faultlineAnnualCost.toFixed(2)}/yr
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Net Annual Value</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>
                  +${netSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '28px' }}>
            <button
              onClick={onLaunchWorkbench}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              Rehearse Pipeline Failures Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
