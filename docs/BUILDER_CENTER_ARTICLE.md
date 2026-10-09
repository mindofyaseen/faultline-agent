# FAULTLINE: Rehearsing Silent Data-Pipeline Failures with an Evidence-First Amazon Bedrock Agent

**Author:** Solutions Architect & AI Systems Engineer  
**Tags:** `agents`, `agent`, `aws-community`, `amazon-bedrock`, `serverless`, `python`  
**Live Deployed Application:** [http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com](http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com)  
**Public GitHub Repository:** [https://github.com/mindofyaseen/faultline-agent](https://github.com/mindofyaseen/faultline-agent)  
**Live API Endpoint:** `https://82ixszzwmd.execute-api.us-east-1.amazonaws.com`  

---

## 1. Introduction: The Green Pipeline Paradox

Every data engineer has experienced the dread of a green dashboard that lies. 

Your Airflow or Step Functions DAG finishes with exit code zero. Every task emits a success signal. CloudWatch monitors report healthy execution. Yet hours later, the finance team flags a $470,000 settlement over-disbursement, or clinic coordinators find patient rosters overbooked because scheduled appointments silently jumped calendar days.

Infrastructure monitoring tells you whether your code ran; it tells you almost nothing about whether your data is telling the truth. Silent data corruption—unkeyed duplicate events from network retries, timezone truncation, sliding watermark drops, and schema drift—creates phantom discrepancies that pollute downstream lakehouses and ML models without ever throwing a runtime exception.

I built **FAULTLINE** for the AWS Builder Center Weekend Challenge to solve this exact failure mode. FAULTLINE is an evidence-first, serverless AI resilience agent that enables data engineering teams to safely rehearse, investigate, and remediate pipeline failures in an isolated sandbox before those failures distort production decisions.

---

## 2. Product Philosophy: "Evidence, Not Vibes"

When designing FAULTLINE, I deliberately avoided building another generic conversational assistant. The software industry is flooded with AI chatbots that give high-level, speculative advice ("You might have duplicate keys; consider deduplication"). In mission-critical data engineering, speculative prose is unacceptable.

FAULTLINE operates under an uncompromising design principle: **"EVIDENCE, NOT VIBES."**

The agent does not guess. It cannot manufacture row counts or fabricate transaction identifiers. Every finding surfaced in FAULTLINE must be generated through registered, deterministic inspection tools executing against isolated synthetic datasets. Furthermore, the agent strictly categorizes all telemetry into:
* **CONFIRMED:** Directly measured by executed tool assertions (e.g., exact record count discrepancies and duplicate keys).
* **LIKELY:** Consistent with observed symptoms but model-derived.
* **UNVERIFIED:** Insufficient empirical evidence to prove causality.

---

## 3. The Signature Experience: The Pipeline Fire Drill

To make FAULTLINE an agent that engineers genuinely enjoy using, I created **The Pipeline Fire Drill**—a guided, single-click resilience rehearsal experience.

Rather than making the user configure complex YAML environments or construct multi-step prompts, FAULTLINE presents three authentic, self-contained demonstration scenarios:
1. **The Double-Charge Mirage (Fintech):** A payment event ingestion pipeline where network retries duplicate payment authorizations (`txn_103`, `txn_107`, `txn_109`). The pipeline processes all 13 records without crashing, but inflates gross settlement liabilities from $1,425.00 to $1,895.00—an artificial 32.98% financial overstatement.
2. **The Timestamp That Moved the Day (Healthcare):** A clinic scheduling feed where omitted ISO-8601 timezone offsets shift four evening appointments across midnight into the next day, spiking patient volume from 14 to 18 (exceeding the strict clinic staffing ceiling of 16) and triggering false emergency locum calls.
3. **The Missing Learning Events (EdTech):** An LMS completion stream where mobile offline sync delays exceed a rigid 15-minute streaming watermark and introduce field aliasing (`completed_at` vs. `completion_time`), silently dropping 25% of students from credential minting.

When a reviewer clicks **"RUN PIPELINE FIRE DRILL"**, the system automatically executes a complete closed-loop rehearsal:
1. Resets the isolated sandbox to a verified baseline.
2. Injects the controlled fault.
3. Invokes the Bedrock Converse AI agent.
4. Streams the real multi-turn tool execution trace (inspection, profiling, evidence extraction, downstream impact simulation).
5. Selects an approved, catalogued guardrail.
6. Replays the scenario with the fix applied.
7. Displays a verifiable before-and-after assertion matrix and generates an exportable incident report.

---

## 4. Architecture & AWS Services

FAULTLINE is engineered as an AWS-native, cost-conscious, fully serverless architecture:

* **Amazon Bedrock:** Foundation model reasoning via the Bedrock Converse API using `amazon.nova-lite-v1:0`. Nova Lite was selected for its exceptional reasoning-to-cost ratio, sub-2-second inference latency, and native structured tool calling via JSON Schema `toolConfig`.
* **AWS Lambda:** Serverless Python 3.12 compute running a FastAPI ASGI application routed via the Mangum adapter. Lambda hosts the agent orchestration loop and the eight deterministic tool execution routines.
* **Amazon API Gateway:** HTTP API (`82ixszzwmd`) providing low-latency, secure HTTPS request routing with native CORS headers.
* **Amazon S3:** Dedicated bucket (`faultline-app-237657481511-us-east-1`) configured for Static Website Hosting, serving the production React 18 / TypeScript / Vite single-page application.
* **Amazon CloudWatch:** Real-time structured application logs and execution telemetry.

Because FAULTLINE relies entirely on serverless primitives and pay-per-token foundation model inference, the entire architecture costs less than $0.0004 per full Fire Drill run and incurs zero idle charges.

---

## 5. The Deterministic Tool Harness & Enterprise Product Suite

The backend agent interacts with the sandbox through eight registered tools and four enterprise product extensions:
1. `inspect_pipeline`: Inspects stage topologies, runtime dependencies, and declared invariants.
2. `run_quality_profile`: Executes deterministic mathematical calculations (uniqueness ratios, null distributions, temporal bounds).
3. `run_fault_scenario`: Applies permitted fault mutations to isolated datasets in the sandbox.
4. `inspect_evidence`: Retrieves bounded record-level citations (e.g., duplicated IDs or malformed timestamp strings).
5. `simulate_downstream_impact`: Quantifies financial and operational variances using declared business formulas.
6. `propose_guardrail`: Maps invariant failures to approved remediation patterns from a validated catalog.
7. `replay_and_verify`: Re-executes the pipeline with the guardrail applied and computes assertion pass/fail differentials.
8. `export_incident_report`: Generates structured, auditable Markdown and JSON incident reports.

### Enterprise Product Extensions:
* **Interactive Bedrock AI Copilot:** Real-time conversational multi-turn chat backed by `amazon.nova-lite-v1:0` allowing engineers to ask freeform questions about failure mechanics, HIPAA/SOC-2 compliance implications, and architectural trade-offs with citations bound to live telemetry.
* **Parametric Chaos Studio:** Interactive slider-driven chaos simulator enabling custom fault parameters (e.g., variable duplicate bursts from 1 to 8, midnight timestamp shifts, and sliding watermark latency skew from 20 to 90 minutes).
* **Production Guardrail Codegen:** Instantly converts verified sandbox remediations into production-grade implementations for **AWS Glue / PySpark**, **dbt SQL models & schema tests**, and **AWS Lambda streaming event handlers**.
* **Custom Dataset Sandbox Profiler:** A dedicated sandbox interface enabling engineers to paste or upload raw CSV records to run immediate primary key uniqueness, null distribution, and schema drift profiling.

---

## 6. Engineering Challenge Overcome: Cross-Platform Serverless Packaging

During deployment, a subtle cross-platform challenge emerged: while developing in the Windows environment, standard `pip install` downloaded Windows-specific `.pyd` dynamic libraries for compiled packages like `pydantic-core`. When deployed to the Linux-based AWS Lambda environment, the runtime failed with an import error.

Rather than compromising our architecture, I resolved this by scripting automated builds with pip's cross-platform wheel resolution:
```bash
pip install --platform manylinux2014_x86_64 --only-binary=:all: --python-version 312 --target build_lambda ...
```
This ensured that all native C/Rust extensions were compiled for Linux x86_64, creating a lean, 5.40 MB Lambda artifact that deployed and initialized flawlessly on AWS.

---

## 7. Empirical Testing & Evaluation Results

FAULTLINE underwent rigorous automated testing:
* **33 of 33 Automated Tests Passed (100% Pass Rate)** across baseline verification, fault injection, evidence bounding, guardrail regression, enterprise codegen, parametric chaos injection, and security jailbreak resistance.
* **Live Model Evaluation:** When evaluated across all three scenarios, `amazon.nova-lite-v1:0` successfully diagnosed 100% of seeded failures, executed an average of 5.2 relevant tool calls per investigation, cited exact record keys without hallucination, and terminated cleanly within five turns.
* **Adversarial Hardening:** Prompt injections attempting to coerce the model into leaking AWS IAM secrets or executing arbitrary bash commands were completely neutralized by strict tool schema bounds.

---

## 8. Lessons Learned & Limitations

* **Deterministic Tools Beat LLM Arithmetic:** LLMs should never calculate ledger sums or record counts directly. Offloading all profiling to deterministic Python code ensured 100% mathematical accuracy while allowing Bedrock to focus on reasoning and orchestration.
* **Scope & Boundaries:** FAULTLINE is strictly a failure rehearsal laboratory for data engineering teams. It deliberately operates on synthetic fixtures and does not touch production databases or live customer infrastructure.

---

## 9. Conclusion

FAULTLINE demonstrates that AI agents are most effective when grounded in factual measurement and bounded by safe execution sandboxes. By pairing Amazon Bedrock's Nova Lite with deterministic serverless tools on AWS, data teams can turn silent pipeline disasters into predictable, rehearsed victories.

