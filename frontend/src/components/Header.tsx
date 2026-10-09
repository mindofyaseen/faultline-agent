import React from 'react';
import { Activity, ShieldCheck, Cpu, Cloud, Terminal } from 'lucide-react';
import { ThreeGlobeRadar } from './ThreeGlobeRadar';

interface HeaderProps {
  awsRegion: string;
  modelId: string;
  engine: string;
  isHealthy?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  awsRegion,
  modelId,
  engine,
  isHealthy = true,
}) => {
  return (
    <header
      className="header-bar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 24px',
        background: 'rgba(12, 19, 36, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        marginBottom: '24px',
      }}
    >
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          className="logo-icon"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)',
          }}
        >
          <Activity size={26} color="#ffffff" />
        </div>
        <div>
          <div
            className="brand-title"
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #f8fafc, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FAULTLINE
          </div>
          <div
            className="brand-tagline"
            style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}
          >
            Data-Pipeline Resilience & Failure Rehearsal Agent
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* 3D Holographic Globe Radar Widget */}
        <ThreeGlobeRadar awsRegion={awsRegion} isHealthy={isHealthy} />

        <div className="status-pills" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="badge badge-cyan" title="AWS Region">
            <Cloud size={13} />
            <span>{awsRegion || 'us-east-1'}</span>
          </div>

          <div className="badge badge-emerald" title="Amazon Bedrock Foundation Model">
            <Cpu size={13} />
            <span>{modelId || 'amazon.nova-lite-v1:0'}</span>
          </div>

          <div className="badge badge-cyan" title="Investigation Engine">
            <Terminal size={13} />
            <span>{engine || 'Bedrock Converse API'}</span>
          </div>

          <div className="badge badge-amber" title="Core Operating Principle">
            <ShieldCheck size={13} />
            <span>EVIDENCE, NOT VIBES</span>
          </div>
        </div>
      </div>
    </header>
  );
};
