import React from 'react';
import { Activity, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { NavTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer
      style={{
        marginTop: '80px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '48px',
        paddingBottom: '32px',
        color: '#94a3b8',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}
      >
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              FAULTLINE
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', lineHeight: '1.6', color: '#64748b' }}>
            The autonomous failure rehearsal and resilience agent for mission-critical data
            pipelines. Built on Amazon Bedrock Nova Lite and AWS Serverless.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '12px',
              fontSize: '0.75rem',
              color: '#f59e0b',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} />
            <span>CORE PRINCIPLE: EVIDENCE, NOT VIBES</span>
          </div>
        </div>

        {/* Col 2: Platform Navigation */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
            Platform Suites
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            <li>
              <button
                onClick={() => onSelectTab('workbench')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}
              >
                Interactive 3D Workbench
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('features')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}
              >
                Product Capabilities & Chaos Engine
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('architecture')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}
              >
                AWS Serverless Architecture & IAM
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('calculator')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}
              >
                Data Downtime ROI Calculator
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Resources & Docs */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
            Documentation & Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            <li>
              <button
                onClick={() => onSelectTab('docs')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textAlign: 'left' }}
              >
                REST API & GitHub Actions CI/CD
              </button>
            </li>
            <li>
              <a
                href="https://github.com/mindofyaseen/faultline-agent"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>GitHub Repository</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://aws.amazon.com/bedrock/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Amazon Bedrock Nova Lite</span>
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: AWS Challenge Badge */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
            AWS Builder Center
          </h4>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '0.78rem',
              lineHeight: '1.4',
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
              Build an Agent Weekend Challenge
            </div>
            <div style={{ color: '#64748b' }}>
              Submission verified on live AWS serverless infrastructure with 33 passing automated tests.
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <div>
          © 2026 FAULTLINE Data Resilience Platform. Released under MIT License.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Crafted for AWS Builder Center with</span>
          <Heart size={13} color="#ef4444" fill="#ef4444" />
        </div>
      </div>
    </footer>
  );
};
