import React from 'react';
import { ShieldCheck, Cpu, Lock, ArrowRight } from 'lucide-react';

interface ArchitecturePageProps {
  onLaunchWorkbench: () => void;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ onLaunchWorkbench }) => {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '44px', paddingTop: '10px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60a5fa',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}
        >
          <span>🏛️ AWS-Native Serverless Topology</span>
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#f8fafc',
            marginBottom: '14px',
            lineHeight: '1.2',
          }}
        >
          Zero-Idle-Cost Serverless Architecture
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#94a3b8',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          Engineered natively for AWS using serverless primitives. Delivers sub-second response
          times, strict least-privilege IAM controls, and zero idle infrastructure costs.
        </p>
      </div>

      {/* Interactive Topology Diagram Box */}
      <div
        style={{
          backgroundColor: '#070b16',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          borderRadius: '20px',
          padding: '36px',
          marginBottom: '40px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(6, 182, 212, 0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              End-to-End Execution Flow
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              AWS us-east-1 Region • HTTPS Secure Transit
            </div>
          </div>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
            }}
          >
            ACTIVE & DEPLOYED
          </span>
        </div>

        {/* Diagram Nodes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            position: 'relative',
          }}
        >
          <div
            style={{
              background: 'rgba(12, 19, 36, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🌐</div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#f8fafc' }}>
              Amazon S3 Hosting
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              faultline-app-...
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
              React 18 + Vite SPA with Three.js 3D WebGL Canvas
            </div>
          </div>

          <div
            style={{
              background: 'rgba(12, 19, 36, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⚡</div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#f8fafc' }}>
              Amazon API Gateway
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              HTTP API (82ixszzwmd)
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
              Low-latency HTTPS routing, CORS authorization & rate limiting
            </div>
          </div>

          <div
            style={{
              background: 'rgba(12, 19, 36, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🐍</div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#f8fafc' }}>
              AWS Lambda
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              faultline-backend-api
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
              Python 3.12 + FastAPI + 8 Deterministic Tools Harness
            </div>
          </div>

          <div
            style={{
              background: 'rgba(12, 19, 36, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🤖</div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#f8fafc' }}>
              Amazon Bedrock
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#c4b5fd', fontFamily: 'monospace' }}>
              amazon.nova-lite-v1:0
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
              Converse API with JSON Schema toolConfig orchestration
            </div>
          </div>
        </div>
      </div>

      {/* Security & Isolation Cards */}
      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginBottom: '20px' }}>
        Enterprise Security & Zero-Trust Sandbox
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(12, 19, 36, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Lock size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Zero Production Data Access
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6' }}>
            FAULTLINE operates strictly in an isolated simulation sandbox. Rehearsals mutate
            synthetic data fixtures only; the agent has zero network pathways, credentials, or
            permissions to read or write live customer production tables.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(12, 19, 36, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldCheck size={22} color="#06b6d4" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Strict Least-Privilege IAM
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6' }}>
            Lambda execution role is bounded by scoped inline policy <code>FaultlineBedrockAccess</code>{' '}
            restricted solely to <code>bedrock:InvokeModel</code> on <code>amazon.nova-lite-v1:0</code>.
            No wildcards, administrative roles, or S3 write access granted to backend runtime.
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(12, 19, 36, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Cpu size={22} color="#a78bfa" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Deterministic Tool Grounding
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6' }}>
            Foundation models are inherently non-deterministic. FAULTLINE delegates 100% of arithmetic,
            key deduplication, and variance calculations to audited Python functions, ensuring
            repeatable mathematical accuracy across repeated runs.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onLaunchWorkbench}
          className="btn btn-primary"
          style={{ padding: '12px 28px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>Explore Live Sandbox in 3D</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
