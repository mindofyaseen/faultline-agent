# AWS Builder Center Weekend Challenge Research & Compliance Matrix

**Document Version:** 1.0.0  
**Date Verified:** October 9, 2026  
**Verified By:** FAULTLINE Lead Architect  

---

## 1. Official Challenge Overview

* **Official Challenge Title:** Weekend Challenge: Build an agent people actually enjoy using
* **Sponsor:** Amazon Web Services (AWS) Builder Center & AWS Community
* **Official Host Platform:** [AWS Builder Center / Community.aws](https://builder.aws.com/)
* **Category:** Autonomous AI Agents / Generative AI / Reliability & Engineering Productivity

---

## 2. Timestamps & Timezone Conversions

| Milestone | Pacific Time (PT) | UTC | Pakistan Standard Time (PKT, UTC+5) |
|---|---|---|---|
| **Challenge Announcement / Active Period** | October 9, 2026 | October 9, 2026 | October 9, 2026 |
| **Official Submission Deadline** | **October 12, 2026, 1:00 PM PT** | **October 12, 2026, 8:00 PM UTC** | **October 13, 2026, 1:00 AM PKT** |
| **Current Project Time** | October 9, 2026, 2:52 AM PT | October 9, 2026, 9:52 AM UTC | **October 9, 2026, 2:52 PM PKT** |
| **Time Remaining to Deadline** | ~75 hours (~3.1 days) | ~75 hours | ~75 hours |

> **Audit Note:** The submission deadline is strictly verified as **October 13, 2026, at 01:00 AM PKT**. All development, verification, deployment, documentation, and push actions are executed well before this window.

---

## 3. Eligibility & Submission Conditions

1. **Builder ID & Profile:**
   - Must have an active AWS Builder ID.
   - Completed community profile with bio, professional focus, and linked handles.
2. **Eligibility:**
   - Open to global developers, cloud engineers, and architects in participating jurisdictions.
   - Genuine, original project built for this challenge cycle.
3. **AWS Deployment Requirement:**
   - The AI agent must run on real AWS infrastructure (not purely local mock).
   - Core runtime: Amazon Bedrock (Foundation model inference via Converse API).
   - Compute & API: AWS Lambda (serverless tool-executing backend) + Amazon API Gateway.
   - Frontend Delivery: Amazon S3 (Static Web Hosting) / Amazon CloudFront.

---

## 4. Mandatory Article & Documentation Requirements

* **Minimum Word Count:** 500 words minimum.
  - *FAULTLINE Target:* 850–1,150 words in `docs/BUILDER_CENTER_ARTICLE.md` to ensure deep technical credibility.
* **Mandatory Article Sections:**
  1. **Introduction & Motivation:** The silent failure paradox — why green data pipelines lie.
  2. **Product Vision:** FAULTLINE and the "Evidence, Not Vibes" core design philosophy.
  3. **Architecture & AWS Stack:** Deep dive into Amazon Bedrock Converse API, AWS Lambda, API Gateway, S3.
  4. **The Signature Experience:** "The Pipeline Fire Drill" interactive workflow.
  5. **Deterministic Tool Harness:** The 8 registered agent inspection tools.
  6. **Three Reproducible Rehearsal Scenarios:** Fintech (Double-Charge Mirage), Healthcare (Timestamp That Moved the Day), EdTech (Missing Learning Events).
  7. **Sandbox Safety & Security Boundaries:** Bounded tool execution, no arbitrary shell/SQL injection.
  8. **Evaluation & Verification Results:** Quantitative benchmarks and test suite passes.
  9. **Key Engineering Challenges Overcome:** Handling tool-call schema fidelity and determinism.
  10. **Lessons Learned & Production Roadmap:** Future steps for enterprise data mesh integration.
* **Tag Discrepancy & Resolution:**
  - *Announcement Text:* references tag `agents`.
  - *Official Terms / Platform Rules:* references tag `agent`.
  - *Strategy:* We will document this discrepancy explicitly and apply **both tags (`agents`, `agent`)** in the AWS Builder Center article metadata so neither automated filters nor manual reviewers miss the submission.
* **Accepted Evidence Formats:**
  - Live deployed web application URL hosted on AWS.
  - Public GitHub repository with clean code, test suite, and MIT license.
  - Screenshots of the visual interface, tool execution traces, before-and-after replays.
  - Exportable incident report (JSON / Markdown).
  - Terminal logs and automated test results (`pytest` passing 100%).

---

## 5. Judging Criteria & FAULTLINE Differentiation

| Evaluation Criteria | Official Expectation | FAULTLINE Implementation & Strategic Advantage |
|---|---|---|
| **User Delight & Experience** | "An agent people actually enjoy using" | High-impact "Pipeline Fire Drill" UI. Calm dark navy workbench, visual pipeline flow, real-time investigation feed, interactive evidence drawer, zero-confusion guided presets. |
| **Technical Credibility** | Real working agent with real tools | Genuine Amazon Bedrock tool use via Converse API (`amazon.nova-lite-v1:0`), 8 deterministic tools, verifiable assertions, no fake tool mockups. |
| **Real-world Utility** | Solves a genuine, painful problem | Directly tackles silent data corruption (data downtime), where pipeline status is green but downstream financial/clinical metrics are distorted. |
| **Security & Safety** | Safe, bounded execution | Isolated sandbox, predefined fault catalog, no arbitrary code execution, zero PII/PHI leakage, strict input schemas. |
| **Completeness & Reproducibility** | Full deployment, reproducible code | End-to-end automated tests, complete SAM/CloudFormation/Lambda deployment, exportable reports, fully documented GitHub repository. |

---

## 6. Compliance Checklist

- [x] Challenge Title & Sponsor identified and verified.
- [x] Deadline verified (Oct 12 1:00 PM PT / Oct 13 1:00 AM PKT).
- [x] Tag discrepancy noted (`agents` and `agent` both mapped).
- [x] Real AWS Bedrock connectivity verified (`amazon.nova-lite-v1:0` responsive).
- [x] AWS credentials active (`arn:aws:iam::237657481511:user/yaseen-cli`).
- [x] 8 deterministic tools mapped.
- [x] 3 synthetic scenarios defined.
- [x] Automated test plan established.
- [x] Target repository confirmed (`https://github.com/mindofyaseen/faultline-agent`).
