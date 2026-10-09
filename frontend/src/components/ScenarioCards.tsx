import React from 'react';
import { CreditCard, CalendarClock, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Scenario } from '../types';

interface ScenarioCardsProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
}

export const ScenarioCards: React.FC<ScenarioCardsProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'scenario_fintech':
        return <CreditCard size={20} className="text-cyan" style={{ color: '#06b6d4' }} />;
      case 'scenario_healthcare':
        return <CalendarClock size={20} className="text-emerald" style={{ color: '#10b981' }} />;
      case 'scenario_edtech':
        return <GraduationCap size={20} className="text-amber" style={{ color: '#f59e0b' }} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'FAULT_INJECTED':
        return <span className="badge badge-hazard">Fault Active</span>;
      case 'REMEDIATED':
        return <span className="badge badge-emerald">Remediated</span>;
      default:
        return <span className="badge badge-cyan">Baseline Green</span>;
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            Rehearsal Scenarios
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Select an isolated synthetic data pipeline to rehearse failure detection and remediation.
          </p>
        </div>
      </div>

      <div className="grid-cols-3">
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <div
              key={sc.id}
              className={`scenario-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectScenario(sc.id)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getIcon(sc.id)}
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                      {sc.domain}
                    </span>
                  </div>
                  {getStateBadge(sc.state)}
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '6px', color: isSelected ? '#38bdf8' : '#fff' }}>
                  {sc.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '12px' }}>
                  {sc.tagline}
                </p>
              </div>

              <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                <span>{sc.stages ? sc.stages.length : 5} Pipeline Stages</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} style={{ color: '#06b6d4' }} /> Sandbox Safe
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
