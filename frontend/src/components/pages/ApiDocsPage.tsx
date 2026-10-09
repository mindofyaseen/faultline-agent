import React, { useState } from 'react';
import { Terminal, Copy, Check, Code, GitBranch } from 'lucide-react';

export const ApiDocsPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const curlInvestigate = `curl -X POST "https://82ixszzwmd.execute-api.us-east-1.amazonaws.com/api/scenarios/scenario_fintech/investigate" \\
  -H "Content-Type: application/json" \\
  -d '{"user_prompt": "Investigate duplicate settlement discrepancy"}'`;

  const githubActionYaml = `name: Pipeline Resilience Pre-Deployment Rehearsal
on: [pull_request]

jobs:
  faultline-drill:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger FAULTLINE Fire Drill
        run: |
          RESPONSE=$(curl -s -X POST "https://82ixszzwmd.execute-api.us-east-1.amazonaws.com/api/scenarios/scenario_fintech/replay" \\
            -H "Content-Type: application/json" \\
            -d '{"guardrail_id": "idempotent_dedupe_on_key"}')
          
          PASSED=$(echo $RESPONSE | jq '.all_invariants_passed')
          if [ "$PASSED" != "true" ]; then
            echo "Pipeline invariants failed guardrail verification!"
            exit 1
          fi
          echo "Remediation verified: 100% assertions passed."`;

  const airflowOperator = `from airflow.operators.python import PythonOperator
import requests

def verify_pipeline_with_faultline():
    url = "https://82ixszzwmd.execute-api.us-east-1.amazonaws.com/api/scenarios/scenario_healthcare/investigate"
    res = requests.post(url, json={})
    data = res.json()
    assert data["rounds_completed"] > 0
    print(f"Bedrock Agent Synthesis: {data.get('synthesis')}")

faultline_task = PythonOperator(
    task_id="faultline_resilience_check",
    python_callable=verify_pipeline_with_faultline,
    dag=dag,
)`;

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
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#c4b5fd',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}
        >
          <span>📚 Developer API & CI/CD Docs</span>
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
          Integrate FAULTLINE into Your Data CI/CD
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
          Automate failure rehearsal directly into your GitHub Actions, Apache Airflow DAGs, and
          dbt Cloud pipelines via REST API.
        </p>
      </div>

      {/* Snippet 1: REST API Curl */}
      <div
        style={{
          backgroundColor: '#070b16',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              1. Direct Bedrock Agent Invocation (cURL)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard('curl', curlInvestigate)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedKey === 'curl' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedKey === 'curl' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre
          style={{
            backgroundColor: '#040711',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#e2e8f0',
            overflowX: 'auto',
          }}
        >
          {curlInvestigate}
        </pre>
      </div>

      {/* Snippet 2: GitHub Actions CI/CD */}
      <div
        style={{
          backgroundColor: '#070b16',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitBranch size={18} color="#a78bfa" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              2. GitHub Actions Automated Resilience Gate (.github/workflows/rehearsal.yml)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard('gha', githubActionYaml)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedKey === 'gha' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedKey === 'gha' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre
          style={{
            backgroundColor: '#040711',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#e2e8f0',
            overflowX: 'auto',
          }}
        >
          {githubActionYaml}
        </pre>
      </div>

      {/* Snippet 3: Apache Airflow */}
      <div
        style={{
          backgroundColor: '#070b16',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={18} color="#34d399" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              3. Apache Airflow Pre-Ingestion Health Guardrail
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard('airflow', airflowOperator)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copiedKey === 'airflow' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedKey === 'airflow' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre
          style={{
            backgroundColor: '#040711',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#e2e8f0',
            overflowX: 'auto',
          }}
        >
          {airflowOperator}
        </pre>
      </div>
    </div>
  );
};
