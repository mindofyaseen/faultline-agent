import React, { useState } from 'react';
import { profileCustomCsv } from '../api';

interface CustomCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV_PRESETS = [
  {
    name: 'Duplicate Payment Stream',
    csv: `transaction_id,account_id,amount,timestamp
TXN_101,ACC_99,120.00,2026-10-10T14:00:00Z
TXN_102,ACC_88,350.00,2026-10-10T14:05:00Z
TXN_101,ACC_99,120.00,2026-10-10T14:00:00Z
TXN_103,ACC_77,85.50,2026-10-10T14:10:00Z`,
  },
  {
    name: 'Ambiguous Timezone Stream',
    csv: `appointment_id,patient_id,scheduled_time,clinic_id
APT_001,P_901,2026-10-10 20:00,CLN_A
APT_002,P_902,2026-10-10 21:00,CLN_A
APT_003,P_903,2026-10-10 22:00,CLN_A
APT_004,P_904,2026-10-10 23:00,CLN_A`,
  },
];

export const CustomCsvModal: React.FC<CustomCsvModalProps> = ({ isOpen, onClose }) => {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_PRESETS[0].csv);
  const [datasetName, setDatasetName] = useState('user_sandbox_stream');
  const [profileResult, setProfileResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProfile = async () => {
    if (!csvText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await profileCustomCsv(csvText, datasetName);
      setProfileResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Profiling failed');
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
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), 0 0 40px rgba(16, 185, 129, 0.15)',
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
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              📊
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Custom Dataset Sandbox Profiler
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Test any pipeline CSV payload in FAULTLINE's isolated quality engine
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

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Load Preset:</span>
            {SAMPLE_CSV_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                onClick={() => {
                  setCsvText(preset.csv);
                  setDatasetName(preset.name.toLowerCase().replace(/ /g, '_'));
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Raw CSV Records (header row required):
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              style={{
                backgroundColor: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                padding: '10px',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* Profiler Action */}
          <button
            onClick={handleProfile}
            disabled={isLoading || !csvText.trim()}
            className="btn btn-primary"
            style={{
              alignSelf: 'flex-start',
              padding: '8px 18px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isLoading && <div className="spinner" style={{ width: '14px', height: '14px' }} />}
            <span>Run Statistical Profile</span>
          </button>

          {errorMsg && (
            <div
              style={{
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.85rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Profile Output */}
          {profileResult && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${
                  profileResult.is_corrupted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'
                }`,
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Analysis Verdict:{' '}
                  <span
                    style={{
                      color: profileResult.is_corrupted ? '#f87171' : '#34d399',
                    }}
                  >
                    {profileResult.is_corrupted
                      ? '⚠️ Silent Data Corruption Detected'
                      : '✓ Clean Records Profiled'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: profileResult.is_corrupted
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                    color: profileResult.is_corrupted ? '#f87171' : '#34d399',
                  }}
                >
                  {profileResult.dataset_name}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '10px',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Records</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{profileResult.row_count}</div>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '10px',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Key Candidate</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {profileResult.primary_key_candidate}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '10px',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Duplicates</div>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: profileResult.duplicate_count > 0 ? '#f87171' : '#34d399',
                    }}
                  >
                    {profileResult.duplicate_count}
                  </div>
                </div>
              </div>

              {/* Sample Table */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Sample Preview (First 5 Rows):
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="evidence-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      {profileResult.columns.map((col: string, idx: number) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profileResult.sample_rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx}>
                        {profileResult.columns.map((col: string, cIdx: number) => (
                          <td key={cIdx}>{row[col] || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
