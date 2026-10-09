import React from 'react';
import {
  Activity,
  Layers,
  Cpu,
  Calculator,
  BookOpen,
  Github,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { ThreeGlobeRadar } from './ThreeGlobeRadar';

export type NavTab = 'workbench' | 'features' | 'architecture' | 'calculator' | 'docs';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  awsRegion?: string;
  isHealthy?: boolean;
  onTriggerFireDrill?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  awsRegion = 'us-east-1',
  isHealthy = true,
  onTriggerFireDrill,
}) => {
  return (
    <nav
      style={{
        position: 'sticky',
        top: '12px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(8, 14, 28, 0.82)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {/* Brand & 3D Globe Radar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          onClick={() => onSelectTab('workbench')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)',
            }}
          >
            <Activity size={22} color="#ffffff" />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #f8fafc, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>FAULTLINE</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  fontWeight: 700,
                  WebkitTextFillColor: '#38bdf8',
                }}
              >
                v1.0 ENTERPRISE
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Data Resilience & Chaos AI Agent
            </div>
          </div>
        </div>

        {/* 3D Cyber-Globe Radar */}
        <ThreeGlobeRadar awsRegion={awsRegion} isHealthy={isHealthy} />
      </div>

      {/* Center Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          gap: '4px',
        }}
      >
        <button
          onClick={() => onSelectTab('workbench')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor:
              activeTab === 'workbench' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            color: activeTab === 'workbench' ? '#38bdf8' : '#94a3b8',
            borderBottom:
              activeTab === 'workbench' ? '2px solid #06b6d4' : '2px solid transparent',
          }}
        >
          <Activity size={14} />
          <span>Live 3D Lab</span>
        </button>

        <button
          onClick={() => onSelectTab('features')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor:
              activeTab === 'features' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            color: activeTab === 'features' ? '#38bdf8' : '#94a3b8',
            borderBottom:
              activeTab === 'features' ? '2px solid #06b6d4' : '2px solid transparent',
          }}
        >
          <Layers size={14} />
          <span>Product Suites</span>
        </button>

        <button
          onClick={() => onSelectTab('architecture')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor:
              activeTab === 'architecture' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            color: activeTab === 'architecture' ? '#38bdf8' : '#94a3b8',
            borderBottom:
              activeTab === 'architecture' ? '2px solid #06b6d4' : '2px solid transparent',
          }}
        >
          <Cpu size={14} />
          <span>AWS Architecture</span>
        </button>

        <button
          onClick={() => onSelectTab('calculator')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor:
              activeTab === 'calculator' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            color: activeTab === 'calculator' ? '#38bdf8' : '#94a3b8',
            borderBottom:
              activeTab === 'calculator' ? '2px solid #06b6d4' : '2px solid transparent',
          }}
        >
          <Calculator size={14} />
          <span>ROI Calculator</span>
        </button>

        <button
          onClick={() => onSelectTab('docs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor:
              activeTab === 'docs' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
            color: activeTab === 'docs' ? '#38bdf8' : '#94a3b8',
            borderBottom:
              activeTab === 'docs' ? '2px solid #06b6d4' : '2px solid transparent',
          }}
        >
          <BookOpen size={14} />
          <span>CI/CD & API</span>
        </button>
      </div>

      {/* Right Side Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a
          href="https://github.com/mindofyaseen/faultline-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            padding: '6px 12px',
          }}
        >
          <Github size={15} />
          <span>GitHub</span>
          <ExternalLink size={12} style={{ opacity: 0.6 }} />
        </a>

        {onTriggerFireDrill && (
          <button
            onClick={() => {
              onSelectTab('workbench');
              setTimeout(() => {
                onTriggerFireDrill();
              }, 100);
            }}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              padding: '6px 14px',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Flame size={15} />
            <span>Fire Drill</span>
          </button>
        )}
      </div>
    </nav>
  );
};
