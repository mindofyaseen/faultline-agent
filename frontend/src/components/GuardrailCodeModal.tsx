import React, { useState, useEffect } from 'react';
import { fetchGuardrailCode } from '../api';

interface GuardrailCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
  scenarioTitle: string;
  guardrailId?: string;
  guardrailName?: string;
}

export const GuardrailCodeModal: React.FC<GuardrailCodeModalProps> = ({
  isOpen,
  onClose,
  scenarioId,
  scenarioTitle,
  guardrailId,
  guardrailName,
}) => {
  const [activeTab, setActiveTab] = useState<'pyspark' | 'dbt' | 'lambda'>('pyspark');
  const [codeSnippets, setCodeSnippets] = useState<{
    pyspark?: string;
    dbt?: string;
    lambda_python?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCode();
    }
  }, [isOpen, scenarioId, guardrailId]);

  const loadCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetchGuardrailCode(scenarioId, guardrailId);
      setCodeSnippets(res.code_snippets || {});
    } catch (err) {
      console.error('Error fetching guardrail code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentCode =
    activeTab === 'pyspark'
      ? codeSnippets.pyspark || '# No PySpark code available'
      : activeTab === 'dbt'
      ? codeSnippets.dbt || '-- No dbt code available'
      : codeSnippets.lambda_python || '# No Lambda code available';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          height: '78vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), 0 0 40px rgba(59, 130, 246, 0.15)',
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
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              📜
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Production Guardrail Code Generator
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {guardrailName || 'Active Remediation Guardrail'} • {scenarioTitle}
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

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '8px',
          }}
        >
          <button
            className={`btn ${activeTab === 'pyspark' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('pyspark')}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            ⚡ AWS Glue / PySpark
          </button>
          <button
            className={`btn ${activeTab === 'dbt' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dbt')}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            🧱 dbt SQL & Model
          </button>
          <button
            className={`btn ${activeTab === 'lambda' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('lambda')}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            🐍 AWS Lambda (Python 3.12)
          </button>

          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: copied ? 'var(--status-healthy)' : undefined,
                color: copied ? 'var(--status-healthy)' : undefined,
              }}
            >
              <span>{copied ? '✓ Copied to Clipboard' : '📋 Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            marginTop: '12px',
            background: '#090d16',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            position: 'relative',
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)',
                gap: '8px',
              }}
            >
              <div className="spinner" style={{ width: '16px', height: '16px' }} />
              Generating verified production code...
            </div>
          ) : (
            <pre
              style={{
                margin: 0,
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {currentCode}
            </pre>
          )}
        </div>

        {/* Explanatory Banner */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            💡 <strong>Zero Code Hallucination:</strong> Guardrail logic is synthesized directly from verified replay assertions.
          </span>
          <span style={{ color: 'var(--accent-cyan)' }}>Enterprise CI/CD Ready</span>
        </div>
      </div>
    </div>
  );
};
