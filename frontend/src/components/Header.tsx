import React from 'react';
import { Activity, ShieldCheck, Cpu, Cloud, Terminal } from 'lucide-react';

interface HeaderProps {
  awsRegion: string;
  modelId: string;
  engine: string;
}

export const Header: React.FC<HeaderProps> = ({
  awsRegion,
  modelId,
  engine,
}) => {
  return (
    <header className="header-bar">
      <div className="brand">
        <div className="logo-icon">
          <Activity size={24} />
        </div>
        <div>
          <div className="brand-title">FAULTLINE</div>
          <div className="brand-tagline">
            Data-Pipeline Resilience & Failure Rehearsal Agent
          </div>
        </div>
      </div>

      <div className="status-pills">
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
    </header>
  );
};
