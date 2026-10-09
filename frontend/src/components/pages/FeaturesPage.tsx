import React from 'react';
import {
  Bot,
  Zap,
  Code2,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface FeaturesPageProps {
  onLaunchWorkbench: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onLaunchWorkbench }) => {
  const features = [
    {
      icon: <Bot size={28} color="#a78bfa" />,
      title: 'Conversational Bedrock Copilot',
      badge: 'Amazon Nova Lite',
      description:
        'Ask real-time freeform questions about active pipeline corruption. Bedrock Nova Lite synthesizes causal explanations strictly bound to executed telemetry metrics, eliminating LLM arithmetic errors and hallucinations.',
      benefits: [
        'Deterministic evidence citations',
        'Multi-turn conversational reasoning',
        'Automatic compliance & business risk translation',
      ],
    },
    {
      icon: <Zap size={28} color="#f87171" />,
      title: 'Parametric Chaos Studio',
      badge: 'Chaos Engineering',
      description:
        'Stress-test streaming and batch data pipelines under controlled, isolated conditions. Adjust duplicate bursts, ambiguous ISO-8601 timestamps across midnight, and sliding watermark latency skew with live slider controls.',
      benefits: [
        'Variable duplicate burst injection (1-8 records)',
        'Midnight calendar rollover simulation',
        'Watermark latency & schema aliasing testbench',
      ],
    },
    {
      icon: <Code2 size={28} color="#60a5fa" />,
      title: '1-Click Production Codegen',
      badge: 'Glue / dbt / Lambda',
      description:
        'Turn validated resilience findings into immediately deployable production code. Generates copy-pasteable PySpark for AWS Glue, incremental dbt models with schema tests, and AWS Lambda streaming event handlers.',
      benefits: [
        'AWS Glue / PySpark Window deduplication',
        'dbt incremental merge & unique_key models',
        'Amazon EventBridge / DynamoDB idempotency filters',
      ],
    },
    {
      icon: <FileSpreadsheet size={28} color="#34d399" />,
      title: 'Custom CSV Sandbox Profiler',
      badge: 'Universal Profiler',
      description:
        'Bring your own data streams. Paste or upload custom CSV payloads into FAULTLINE’s isolated profiling engine to calculate primary key candidate uniqueness, null ratios, and data corruption verdicts in milliseconds.',
      benefits: [
        'Instant client-side + serverless validation',
        'Automatic candidate key inference',
        'Direct integration with CI/CD pre-commit hooks',
      ],
    },
    {
      icon: <ShieldCheck size={28} color="#06b6d4" />,
      title: 'Verifiable Replay Verification',
      badge: 'Zero-Hallucination',
      description:
        'Remediations are not accepted on faith. FAULTLINE automatically replays the synthetic data pipeline with the proposed guardrail applied, computing explicit assertion matrices to mathematically prove zero record loss.',
      benefits: [
        'Strict Before-vs-After telemetry matrix',
        'Visual cyan/emerald execution topology',
        '100% invariant assertion compliance check',
      ],
    },
    {
      icon: <FileText size={28} color="#fbbf24" />,
      title: 'Auditable Incident Dossiers',
      badge: 'SOC-2 & HIPAA Ready',
      description:
        'Generate executive-ready Markdown and structured JSON post-mortem reports. Documents exact root cause chronologies, financial impact variances, and applied remediation code for audit committees.',
      benefits: [
        'Exportable GitHub Markdown & JSON',
        'Root cause timeline & tool trace audit log',
        'Automated executive risk summaries',
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', paddingTop: '10px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#38bdf8',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}
        >
          <span>⚡ Complete Resilience Product Suite</span>
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
          Everything You Need to Prevent{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Silent Pipeline Disasters
          </span>
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
          Traditional monitoring only verifies task execution status. FAULTLINE provides an
          autonomous AI agent platform that measures semantic data truth, rehearses failure
          modes, and proves remediations before bad data reaches production databases.
        </p>
      </div>

      {/* Feature Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        {features.map((feat, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'rgba(12, 19, 36, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {feat.icon}
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 600,
                }}
              >
                {feat.badge}
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '10px',
              }}
            >
              {feat.title}
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                color: '#94a3b8',
                lineHeight: '1.6',
                marginBottom: '20px',
                flex: 1,
              }}
            >
              {feat.description}
            </p>

            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {feat.benefits.map((b, bIdx) => (
                <div
                  key={bIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                  }}
                >
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive CTA Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: '20px',
          padding: '36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
            Ready to experience a live Pipeline Fire Drill?
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', maxWidth: '600px' }}>
            Test our 3 authentic scenarios in the interactive 3D WebGL laboratory with live Bedrock
            Nova Lite inference in us-east-1.
          </p>
        </div>

        <button
          onClick={onLaunchWorkbench}
          className="btn btn-primary"
          style={{
            padding: '12px 28px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Launch 3D Workbench</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
