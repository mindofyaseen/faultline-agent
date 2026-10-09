import React from 'react';
import { Terminal, Cpu, CheckCircle2, ChevronRight, Bot } from 'lucide-react';
import { ToolTrace } from '../types';

interface InvestigationFeedProps {
  toolTraces: ToolTrace[];
  synthesis: string;
  isInvestigating: boolean;
  modelId: string;
}

export const InvestigationFeed: React.FC<InvestigationFeedProps> = ({
  toolTraces,
  synthesis,
  isInvestigating,
  modelId,
}) => {
  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} style={{ color: '#06b6d4' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            Agent Activity & Tool Execution Trace
          </h3>
        </div>
        <div className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          <Cpu size={12} />
          <span>{modelId || 'amazon.nova-lite-v1:0'}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Terminal log feed */}
        <div className="terminal-container" style={{ flex: 1, minHeight: '260px' }}>
          {toolTraces && toolTraces.length > 0 ? (
            toolTraces.map((trace, idx) => (
              <div key={idx} className="terminal-line" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                <span className="terminal-round">R{trace.round}</span>
                <span className="terminal-tag">[{trace.tool_name}]</span>
                <div style={{ flex: 1, color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>args:</span>
                    <span style={{ color: '#38bdf8' }}>{JSON.stringify(trace.input)}</span>
                  </div>
                  {trace.output && (
                    <div style={{ marginTop: '3px', color: '#a7f3d0', fontSize: '0.78rem' }}>
                      <ChevronRight size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      <span>
                        {typeof trace.output === 'object'
                          ? trace.output.message ||
                            `Returned ${trace.output.record_count || trace.output.evidence_count || Object.keys(trace.output).length} metrics`
                          : String(trace.output)}
                      </span>
                    </div>
                  )}
                </div>
                <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              </div>
            ))
          ) : isInvestigating ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '8px' }}>
                ⚙️
              </div>
              <p>Amazon Bedrock model is inspecting pipeline telemetry and executing tools...</p>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              <p>No active investigation. Click <strong>RUN FIRE DRILL</strong> or <strong>Investigate with Bedrock</strong> to inspect the sandbox.</p>
            </div>
          )}
        </div>

        {/* Synthesis box */}
        {synthesis && (
          <div
            style={{
              background: 'rgba(6, 182, 212, 0.05)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '0.84rem',
              color: '#e2e8f0',
              lineHeight: '1.45',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#38bdf8', fontWeight: 600 }}>
              <Bot size={15} />
              <span>Agent Synthesis & Diagnosis</span>
            </div>
            <div>{synthesis}</div>
          </div>
        )}
      </div>
    </div>
  );
};
