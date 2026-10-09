import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Box,
  LayoutGrid,
} from 'lucide-react';
import { PipelineStage } from '../types';
import { ThreePipelineScene } from './ThreePipelineScene';

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
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

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
    <div
      className={`panel ${
        state === 'FAULT_INJECTED'
          ? 'panel-hazard'
          : state === 'REMEDIATED'
          ? 'panel-cyan'
          : ''
      }`}
      style={{ marginBottom: '24px' }}
    >
      {/* Header bar with Mode Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.74rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#06b6d4',
              fontWeight: 700,
            }}
          >
            Active Pipeline Execution Graph
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
            {scenarioTitle}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* 3D vs 2D View Mode Selector */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              onClick={() => setViewMode('3d')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor:
                  viewMode === '3d' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                color: viewMode === '3d' ? '#38bdf8' : '#94a3b8',
              }}
            >
              <Box size={14} />
              <span>3D Holographic</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor:
                  viewMode === '2d' ? 'rgba(6, 182, 212, 0.25)' : 'transparent',
                color: viewMode === '2d' ? '#38bdf8' : '#94a3b8',
              }}
            >
              <LayoutGrid size={14} />
              <span>2D Topology</span>
            </button>
          </div>

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

      {/* RENDER MODE: 3D Holographic Scene */}
      {viewMode === '3d' && (
        <ThreePipelineScene
          stages={stages}
          state={state}
          scenarioTitle={scenarioTitle}
        />
      )}

      {/* RENDER MODE: 2D Stage Nodes */}
      {viewMode === '2d' && (
        <div className="pipeline-flow">
          {stages &&
            stages.map((st, idx) => (
              <React.Fragment key={st.id}>
                <div className={`pipeline-node ${getNodeClass(st)}`}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                      STAGE {idx + 1}
                    </span>
                    {getStatusIcon(st)}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      color: '#f8fafc',
                      marginBottom: '4px',
                    }}
                  >
                    {st.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      lineHeight: '1.3',
                      marginBottom: '6px',
                    }}
                  >
                    {st.description}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.68rem',
                      color: '#94a3b8',
                    }}
                  >
                    <Clock size={11} /> {st.runtime_ms || 100}ms
                  </div>
                </div>

                {idx < stages.length - 1 && (
                  <div
                    className={`pipeline-connector ${
                      state === 'REMEDIATED' ? 'active' : ''
                    }`}
                  >
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
      )}
    </div>
  );
};
