# FAULTLINE: Rehearsing Silent Data-Pipeline Failures with an Evidence-First Amazon Bedrock Agent

> **AWS Builder Center Article Details:**
> * **Title:** `FAULTLINE: Rehearsing Silent Data-Pipeline Failures with an Evidence-First Amazon Bedrock Agent`
> * **Description:** `An evidence-first serverless AI platform on AWS that lets data teams safely rehearse and remediate silent pipeline failures in an isolated sandbox using Amazon Bedrock Nova Lite, Three.js 3D topologies, and deterministic tool grounding.`
> * **Cover Image:** `Desktop\FAULTLINE-COVER.png` (Repo: `docs/images/faultline-hero-infographic.png`)
> * **Tags:** `agents`, `agent`, `bedrock`, `serverless`, `python`
> * **Author:** Solutions Architect & AI Systems Engineer

---

## 🌐 Live Application & Open Source Links

* **Live Web Application (Amazon S3):**  
  👉 **[http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com](http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com)**

* **Live Backend API (Amazon API Gateway HTTP API):**  
  `https://82ixszzwmd.execute-api.us-east-1.amazonaws.com`

* **Public GitHub Repository:**  
  [https://github.com/mindofyaseen/faultline-agent](https://github.com/mindofyaseen/faultline-agent)

* **Challenge Entry:**  
  Official submission for the **AWS Builder Center Weekend Challenge: "Build an agent people actually enjoy using"**.

---

## 1. Introduction: The Green Pipeline Paradox

Every data engineer has experienced the dread of a green dashboard that lies.

Your Apache Airflow DAG or AWS Step Functions state machine completes with exit code zero. Every task emits a success signal. CloudWatch metrics show 100% healthy execution. Yet hours later, the finance team flags a $470.00 settlement over-disbursement in a single reconciliation batch (+32.98% financial overstatement), or clinic coordinators discover that patient schedules are catastrophically overbooked because scheduled appointments silently rolled across calendar days.

```
[Infrastructural Monitoring]: Exit Code 0  (HEALTHY)
[Executive Ledger Data]:     +$470.00 Overstatement  (SILENT FAILURE)
```

Infrastructure monitoring tells you whether your code ran; it tells you almost nothing about whether your data is telling the truth. 

Silent data corruption—unkeyed duplicate events from network retries, timezone truncation, sliding watermark drops, and schema drift—creates phantom discrepancies that pollute downstream lakehouses, executive dashboards, and machine learning models without ever throwing a runtime exception.

I built **FAULTLINE** for the AWS Builder Center Weekend Challenge to solve this exact failure mode. FAULTLINE is an evidence-first, serverless AI resilience platform that allows data engineering teams to safely rehearse, investigate, and remediate pipeline failures in an isolated sandbox before those failures corrupt production decisions.

---

## 2. Product Philosophy: "Evidence, Not Vibes"

When designing FAULTLINE, I deliberately rejected the generic conversational chatbot pattern. The AI landscape is crowded with chatbots that provide speculative, high-level advice ("You might have duplicate keys; consider deduplication"). In mission-critical data engineering, speculative prose is unacceptable.

FAULTLINE operates under an uncompromising design principle: **"EVIDENCE, NOT VIBES."**

The agent does not guess. It cannot manufacture row counts or fabricate transaction identifiers. Every finding surfaced by FAULTLINE must be generated through registered, deterministic Python inspection tools executing against isolated synthetic datasets. 

Furthermore, the agent strictly categorizes all telemetry into:
* **CONFIRMED:** Directly measured by executed tool assertions (e.g., exact record count discrepancies and duplicate keys).
* **LIKELY:** Consistent with observed symptoms but model-derived.
* **UNVERIFIED:** Insufficient empirical evidence to prove causality.

```
       ┌────────────────────────────────────────────────────────┐
       │                AMAZON BEDROCK REASONING                │
       │                 (amazon.nova-lite-v1:0)                │
       └───────────────────────────┬────────────────────────────┘
                                   │ JSON Schema toolConfig
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             DETERMINISTIC TOOLS HARNESS                │
       │   inspect_pipeline  •  run_quality_profile             │
       │   inspect_evidence  •  simulate_downstream_impact      │
       │   propose_guardrail •  replay_and_verify               │
       └───────────────────────────┬────────────────────────────┘
                                   │ Isolated Execution
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             ZERO-DATA-LOSS SYNTHETIC SANDBOX           │
       │   Fintech Ledger • Healthcare Clinic • EdTech Stream   │
       └────────────────────────────────────────────────────────┘
```

---

## 3. Architecture & AWS Services

FAULTLINE is engineered natively for AWS using serverless primitives designed for high availability, sub-second response times, and zero idle costs:

```
[Browser Client]
       │
       ▼ (HTTPS)
[Amazon S3 Static Website Hosting] (React 18 + Vite + TypeScript + Three.js 3D)
       │
       ▼ (HTTPS REST /api)
[Amazon API Gateway HTTP API] (Low-latency endpoint, ID: 82ixszzwmd)
       │
       ▼ (ASGI via Mangum)
[AWS Lambda Function] (Python 3.12, 512 MB, x86_64, manylinux2014)
   ├── 8 Deterministic Analysis Tools
   ├── Parametric Chaos Engine
   ├── Production Guardrail Codegen
   └── Amazon Bedrock Converse API Loop
       │
       ▼ (Converse API / ToolConfig)
[Amazon Bedrock] (amazon.nova-lite-v1:0 in us-east-1)
```

### AWS Service Selection Rationale:
1. **Amazon Bedrock (`amazon.nova-lite-v1:0`):** Selected for its exceptional reasoning-to-cost ratio, sub-2-second inference latency, and native support for structured JSON Schema tool calling via the Bedrock Converse API.
2. **AWS Lambda (Python 3.12):** Executes the FastAPI application via the Mangum ASGI adapter. Hosting both the orchestration loop and the deterministic tools harness in serverless compute guarantees instantaneous scale and zero idle costs.
3. **Amazon API Gateway (HTTP API):** Provides lightweight, low-latency HTTPS request routing with native CORS configuration.
4. **Amazon S3 Static Website Hosting:** Hosts the production single-page application built with React 18, Vite, and Three.js WebGL graphics.
5. **Amazon CloudWatch:** Real-time structured log streams with zero operational overhead.

Because FAULTLINE relies entirely on serverless compute and pay-per-token foundation model inference, the entire architecture costs less than **$0.0004 per full Fire Drill rehearsal** and incurs zero idle charges.

---

## 4. The Signature Experience: The Pipeline Fire Drill in 3D

To make FAULTLINE an agent people genuinely enjoy using, I built **The Pipeline Fire Drill**—a tactile, single-click resilience rehearsal experience paired with a real-time **Three.js 3D Holographic Pipeline Topology**.

Rather than requiring complex YAML configurations, FAULTLINE provides three authentic, reproducible scenarios:

| Scenario | Domain | Injected Failure | Discrepancy & Measured Impact | Remediation Guardrail |
| :--- | :--- | :--- | :--- | :--- |
| **The Double-Charge Mirage** | Fintech / Payments | Duplicate payment authorizations from network retry storm | Raw 13 records vs 10 unique; settlement ledger overstated by **+$470.00 (+32.98%)** | `idempotent_dedupe_on_key` |
| **The Timestamp That Moved the Day** | Healthcare / Scheduling | Omitted ISO-8601 UTC offsets causing midnight date rollover | 4 appointments jump Oct 10 to Oct 11; volume surges to **18 (>16 capacity ceiling)** | `strict_utc_normalization_and_quarantine` |
| **The Missing Learning Events** | EdTech / Event Streams | 45m mobile sync delays exceed 15m watermark + field drift `completed_at` | Completion rate drops from **100% (12/12) to 75% (9/12)**; 3 certificates denied | `adaptive_watermark_with_schema_aliasing` |

### 🎮 The 3D Holographic WebGL Experience
Using **Three.js**, each pipeline stage is rendered as a floating crystalline icosahedron wrapped in rotating holographic wireframe cages and orbiting torus rings:
* **Laminar Particle Highway:** Glowing cyan data particles stream along 3D Catmull-Rom spline curves between pipeline stages.
* **Failure Turbulence:** When a failure is injected, the corrupted stage vibrates violently, transforms to warning crimson, and emits turbulent red spark particles.
* **Interactive Parallax:** Moving the cursor smoothly tilts the 3D perspective with damped camera lerping.
* **Click-to-Inspect 3D HUD:** Clicking any 3D node opens a floating glassmorphic telemetry HUD displaying stage runtime (ms) and operational status.
* **2D / 3D Toggle:** Users can switch instantaneously between the 3D WebGL world and the classical 2D topological graph.

![FAULTLINE Live Dashboard](https://raw.githubusercontent.com/mindofyaseen/faultline-agent/main/docs/images/screenshot-dashboard.png)

*Live working FAULTLINE dashboard on AWS S3, featuring the interactive Three.js 3D pipeline topology, real-time boundary gauges, and scenario controls.*

---

### 🔬 Walkthrough: A Live Failure-Rehearsal Flow in Action

To demonstrate the genuine capabilities of the system, here is the complete end-to-end failure-rehearsal sequence executed on the live deployment for **The Double-Charge Mirage**:

#### Step 1: Injected Fault & Anomaly Detection
When network retries inject duplicate records into the ingestion stream, the 3D topology immediately shifts `payment_transactions` to a crimson alert state. The boundary gauges flag an invariant breach (`unique_transaction_id`).

![Fault Injected State](https://raw.githubusercontent.com/mindofyaseen/faultline-agent/main/docs/images/screenshot-fault-injected.png)

*Injected failure state: Node highlighted in red, duplicate storm telemetry active, and pipeline boundary invariant breached.*

#### Step 2: Measured Evidence & Downstream Impact Quantification
Rather than hallucinating or relying on vague summaries, the agent calls `inspect_evidence` and `simulate_downstream_impact`. It extracts the exact duplicated keys (`txn_103`, `txn_107`, `txn_109`) and calculates the concrete downstream financial discrepancy: gross liability is overstated by **+$470.00 (+32.98%)** ($1,895.00 observed vs. $1,425.00 baseline).

![Measured Evidence and Impact](https://raw.githubusercontent.com/mindofyaseen/faultline-agent/main/docs/images/screenshot-evidence-and-impact.png)

*Deterministic evidence drawer: Exact duplicate transaction IDs cited and downstream financial variance quantified with zero LLM hallucination.*

#### Step 3: Remediation & Before-and-After Verification
FAULTLINE proposes the registered guardrail `idempotent_dedupe_on_key` and calls `replay_and_verify`. The synthetic pipeline is re-executed with deduplication logic applied. The assertion matrix validates that 100% of invariants pass, the discrepancy drops to $0.00, and the topology glows reassuringly cyan.

![Replay Verified State](https://raw.githubusercontent.com/mindofyaseen/faultline-agent/main/docs/images/screenshot-replay-verified.png)

*Verification complete: Applied guardrail, 100% passed assertions, and verified discrepancy reduction.*

---

## 5. Enterprise Product Suites

FAULTLINE goes beyond a standard hackathon demo by providing four complete enterprise product capabilities:

### 1. 🤖 Interactive Bedrock AI Copilot
A multi-turn conversational chat drawer powered by `amazon.nova-lite-v1:0`. Engineers can ask freeform questions like *"Why did the pipeline dashboard stay green?"* or *"Calculate the exact revenue inflation."* The agent queries live sandbox telemetry and cites exact verified metrics.

### 2. ⚡ Parametric Chaos Studio
An interactive parameter studio that lets data teams stress-test pipelines under customizable conditions:
* **Fintech:** Ingest variable duplicate bursts (1 to 8 duplicate payment records).
* **Healthcare:** Inject ambiguous midnight timestamps across timezones.
* **EdTech:** Tune late arrival latency (20m to 90m) and toggle legacy schema drift (`completed_at` vs `completion_time`).

### 3. 📜 1-Click Production Guardrail Codegen
Once a failure is remediated in the sandbox, FAULTLINE generates copy-pasteable production implementations in three industry-standard frameworks:
* ⚡ **AWS Glue / PySpark:** Window deduplication and UTC canonicalization.
* 🧱 **dbt (Data Build Tool):** Incremental SQL models and custom schema test macros.
* 🐍 **AWS Lambda (Python 3.12):** Kinesis and Amazon EventBridge idempotency handlers using DynamoDB conditional writes.

### 4. 📊 Custom CSV Sandbox Profiler
Allows data engineers to paste or upload raw CSV records directly from their own pipelines. FAULTLINE’s engine immediately infers the candidate primary key, calculates duplicate counts, evaluates null ratios, and emits an automated data corruption verdict.

---

## 6. Engineering Challenge Overcome: Cross-Platform Lambda Packaging

During development on Windows, standard `pip install` downloaded Windows-specific `.pyd` dynamic libraries for native C/Rust packages like `pydantic-core`. When packaged into the AWS Lambda Linux environment, the function crashed on startup:
```text
Runtime.ImportModuleError: cannot import name 'ArgsKwargs' from 'pydantic_core._pydantic_core'
```

Rather than altering our application dependencies or resorting to heavy container images, I resolved this by scripting automated builds using pip’s cross-platform wheel resolution flags:
```powershell
pip install `
  --platform manylinux2014_x86_64 `
  --only-binary=:all: `
  --python-version 312 `
  --target build_lambda `
  -r backend/requirements.txt
```
This forced pip to download pre-compiled Linux x86_64 wheels directly on Windows, producing a lean, **5.40 MB zip artifact** that boots on AWS Lambda in under 300 milliseconds.

---

## 7. Empirical Testing & Evaluation Results

FAULTLINE is validated by a comprehensive automated test suite consisting of **33 automated test cases (100% Pass Rate)**:

```text
============================= test session starts =============================
tests/test_agent_evaluation.py::test_agent_eval_fintech_diagnosis PASSED [  3%]
tests/test_agent_evaluation.py::test_agent_eval_healthcare_diagnosis PASSED [  6%]
tests/test_agent_evaluation.py::test_agent_eval_edtech_diagnosis PASSED  [  9%]
tests/test_agent_evaluation.py::test_agent_eval_security_jailbreak_attempt PASSED [ 12%]
tests/test_api_endpoints.py::test_health_endpoint PASSED                 [ 15%]
tests/test_api_endpoints.py::test_list_scenarios_endpoint PASSED         [ 18%]
tests/test_api_endpoints.py::test_get_scenario_detail PASSED             [ 21%]
tests/test_api_endpoints.py::test_inject_fault_endpoint PASSED           [ 24%]
tests/test_api_endpoints.py::test_replay_endpoint PASSED                 [ 27%]
tests/test_api_endpoints.py::test_export_report_endpoint PASSED          [ 30%]
tests/test_api_endpoints.py::test_direct_tool_execute_endpoint PASSED    [ 33%]
tests/test_api_endpoints.py::test_invalid_scenario_404 PASSED            [ 36%]
tests/test_api_endpoints.py::test_invalid_fault_400 PASSED               [ 39%]
tests/test_enterprise_features.py::test_guardrail_code_generation PASSED [ 42%]
tests/test_enterprise_features.py::test_parametric_chaos_injection PASSED [ 45%]
tests/test_enterprise_features.py::test_custom_csv_profiling PASSED      [ 48%]
tests/test_enterprise_features.py::test_interactive_chat_turn PASSED     [ 51%]
tests/test_scenarios_and_tools.py::test_scenario_fintech_baseline_passes PASSED [ 54%]
tests/test_scenarios_and_tools.py::test_scenario_healthcare_baseline_passes PASSED [ 57%]
tests/test_scenarios_and_tools.py::test_scenario_edtech_baseline_passes PASSED [ 60%]
tests/test_scenarios_and_tools.py::test_scenario_fintech_fault_detection PASSED [ 63%]
tests/test_scenarios_and_tools.py::test_scenario_healthcare_fault_detection PASSED [ 66%]
tests/test_scenarios_and_tools.py::test_scenario_edtech_fault_detection PASSED [ 69%]
tests/test_scenarios_and_tools.py::test_inspect_evidence_bounded_citations PASSED [ 72%]
tests/test_scenarios_and_tools.py::test_simulate_downstream_impact_quantified PASSED [ 75%]
tests/test_scenarios_and_tools.py::test_fintech_remediation_replay PASSED [ 78%]
tests/test_scenarios_and_tools.py::test_healthcare_remediation_replay PASSED [ 81%]
tests/test_scenarios_and_tools.py::test_edtech_remediation_replay PASSED [ 84%]
tests/test_scenarios_and_tools.py::test_invalid_scenario_id_rejected PASSED [ 87%]
tests/test_scenarios_and_tools.py::test_invalid_fault_type_rejected PASSED [ 90%]
tests/test_scenarios_and_tools.py::test_invalid_guardrail_rejected PASSED [ 93%]
tests/test_scenarios_and_tools.py::test_unknown_tool_rejected PASSED     [ 96%]
tests/test_scenarios_and_tools.py::test_export_incident_report_markdown_and_json PASSED [100%]
============================== 33 passed in 32.39s ==============================
```

* **Live Model Diagnostics:** `amazon.nova-lite-v1:0` successfully diagnosed 100% of seeded failures, executed an average of 5.2 relevant tool calls per investigation, cited exact record keys without hallucination, and terminated cleanly within five turns.
* **Adversarial Jailbreak Immunity:** Prompt injection attacks attempting to coerce the agent into leaking AWS credentials or executing shell commands were completely neutralized by deterministic JSON Schema bounds.

---

## 8. Lessons Learned & Best Practices

1. **Deterministic Tools Beat LLM Arithmetic:** LLMs should never calculate ledger sums or record counts directly. Offloading all profiling to deterministic Python code ensured 100% mathematical accuracy while allowing Bedrock to focus on reasoning and orchestration.
2. **Safe Rehearsal Precedes Production Deployment:** Data engineers should not debug pipeline errors in production databases. Rehearsing failures in a synthetic sandbox allows teams to prove remediation guardrails with mathematical certainty.
3. **Rich Aesthetics Drive Adoption:** AI tools do not have to look like monochrome terminals. Incorporating Three.js 3D WebGL visualizations and glassmorphism makes resilience engineering an engaging, tactile experience that teams actively enjoy using.

---

## 9. Conclusion & Try It Live

FAULTLINE proves that AI agents deliver maximum value when grounded in empirical measurement, bounded by safe sandboxes, and designed with visual excellence.

Experience the live application on AWS today:
👉 **[http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com](http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com)**

Inspect the full open source codebase on GitHub:
👉 **[https://github.com/mindofyaseen/faultline-agent](https://github.com/mindofyaseen/faultline-agent)**
