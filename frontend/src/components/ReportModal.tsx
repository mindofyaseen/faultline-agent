import React, { useState } from 'react';
import { X, Copy, Download, Check, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportMarkdown: string;
  reportJson: any;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportMarkdown,
  reportJson,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const contentToDisplay =
    activeTab === 'markdown'
      ? reportMarkdown
      : JSON.stringify(reportJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'markdown' ? 'md' : 'json';
    const mime = activeTab === 'markdown' ? 'text/markdown' : 'application/json';
    const blob = new Blob([contentToDisplay], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faultline-incident-report.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} style={{ color: '#06b6d4' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              FAULTLINE Incident Rehearsal Report
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', background: '#090e1c', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                className={`btn ${activeTab === 'markdown' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                onClick={() => setActiveTab('markdown')}
              >
                Markdown
              </button>
              <button
                className={`btn ${activeTab === 'json' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                onClick={() => setActiveTab('json')}
              >
                JSON
              </button>
            </div>

            <button
              className="btn btn-secondary"
              style={{ padding: '6px', borderRadius: '6px' }}
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
          <pre
            style={{
              background: '#060a14',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '480px',
              overflowY: 'auto',
            }}
          >
            {contentToDisplay}
          </pre>
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={16} />
            <span>Download Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
