import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { PipelineStage } from '../types';

interface PipelineVisualizerProps {
  stages: PipelineStage[];
  scenarioTitle: string;
  state: 'BASELINE' | 'FAULT_INJECTED' | 'REMEDIATED';
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  stages,
  scenarioTitle,
  state,
}) => {
  const getNodeClass = (stage: PipelineStage) => {
    if (stage.status === 'FAILED') return 'node-failed';
    if (stage.status === 'WARNING') return 'node-failed';
    if (stage.status === 'REMEDIATED' || state === 'REMEDIATED') return 'node-remediated';
    return 'node-healthy';
  };

  const getStatusIcon = (stage: PipelineStage) => {
    if (stage.status === 'FAILED') {
      return <AlertTriangle size={15} style={{ color: '#ef4444' }} />;
    }
    if (stage.status === 'REMEDIATED' || state === 'REMEDIATED') {
      return <ShieldCheck size={15} style={{ color: '#06b6d4' }} />;
    }
    return <CheckCircle2 size={15} style={{ color: '#10b981' }} />;
  };

  return (
    <div className={`panel ${state === 'FAULT_INJECTED' ? 'panel-hazard' : state === 'REMEDIATED' ? 'panel-cyan' : ''}`} style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#06b6d4', fontWeight: 700 }}>
            Active Pipeline Topology
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            {scenarioTitle} — Execution Graph
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {state === 'FAULT_INJECTED' && (
            <div className="badge badge-hazard">
              <span>Silent Failure Active</span>
            </div>
          )}
          {state === 'REMEDIATED' && (
            <div className="badge badge-cyan">
              <span>Guardrail In Effect</span>
            </div>
          )}
          {state === 'BASELINE' && (
            <div className="badge badge-emerald">
              <span>Healthy Baseline</span>
            </div>
          )}
        </div>
      </div>

      <div className="pipeline-flow">
        {stages && stages.map((st, idx) => (
          <React.Fragment key={st.id}>
            <div className={`pipeline-node ${getNodeClass(st)}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                  STAGE {idx + 1}
                </span>
                {getStatusIcon(st)}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#f8fafc', marginBottom: '4px' }}>
                {st.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.3', marginBottom: '6px' }}>
                {st.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#94a3b8' }}>
                <Clock size={11} /> {st.runtime_ms || 100}ms
              </div>
            </div>

            {idx < stages.length - 1 && (
              <div className={`pipeline-connector ${state === 'REMEDIATED' ? 'active' : ''}`}>
                <ArrowRight
                  size={14}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: state === 'FAULT_INJECTED' ? '#ef4444' : '#06b6d4',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
