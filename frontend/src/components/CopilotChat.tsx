import React, { useState } from 'react';
import { chatWithCopilot } from '../api';

interface CopilotChatProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
  scenarioTitle: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  timestamp?: string;
}

const DEFAULT_PROMPTS = [
  'Why did the pipeline dashboard stay green despite data corruption?',
  'What is the exact financial or operational downstream risk?',
  'Explain how the remediation guardrail prevents this failure.',
  'What regulatory/compliance standards are breached here?',
];

export const CopilotChat: React.FC<CopilotChatProps> = ({
  isOpen,
  onClose,
  scenarioId,
  scenarioTitle,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your FAULTLINE Copilot powered by Amazon Bedrock Nova Lite. I have direct access to the live sandbox telemetry for "${scenarioTitle}". Ask me anything about the silent failure, downstream risks, or guardrail code.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await chatWithCopilot(scenarioId, text, history);

      const assistantMsg: Message = {
        role: 'assistant',
        content: res.answer,
        citations: res.tool_citations,
        timestamp: res.timestamp ? new Date(res.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Copilot error: ${err.message || 'Failed to reach Amazon Bedrock.'}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          height: '82vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
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
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              🤖
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                FAULTLINE AI Copilot
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Amazon Bedrock Nova Lite • Live Sandboxed Telemetry Active
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

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor:
                  m.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                border: `1px solid ${
                  m.role === 'user' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'
                }`,
                borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                padding: '12px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span style={{ fontWeight: 600, color: m.role === 'user' ? '#93c5fd' : '#a78bfa' }}>
                  {m.role === 'user' ? 'You' : 'Bedrock Nova Lite Agent'}
                </span>
                <span>{m.timestamp}</span>
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>

              {m.citations && m.citations.length > 0 && (
                <div
                  style={{
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Evidence Citations:
                  </span>
                  {m.citations.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      style={{
                        fontSize: '0.68rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#6ee7b7',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '4px',
                        padding: '1px 6px',
                        fontFamily: 'monospace',
                      }}
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 16px',
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '12px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div className="spinner" style={{ width: '14px', height: '14px' }} />
              Querying Amazon Bedrock Nova Lite & verifying telemetry...
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px 0',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {DEFAULT_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                padding: '4px 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            gap: '10px',
            paddingTop: '8px',
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask Copilot about ${scenarioTitle}...`}
            disabled={isLoading}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="btn btn-primary"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Ask</span>
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
};
