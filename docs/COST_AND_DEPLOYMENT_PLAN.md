# FAULTLINE — AWS Architecture, Cost & Deployment Plan

**Document Version:** 1.0.0  
**Target AWS Region:** `us-east-1` (US East - N. Virginia)  
**Account ID:** `237657481511`  
**Execution Identity:** `arn:aws:iam::237657481511:user/yaseen-cli`  

---

## 1. Architecture Overview

FAULTLINE utilizes a serverless, cost-conscious, highly available AWS architecture designed for high reliability, deterministic tool execution, and zero idle costs:

```
[User Browser]
       │
       ▼ (HTTPS)
[Amazon S3 Static Hosting / CloudFront]  <── Frontend SPA (React + TypeScript + Vite)
       │
       ▼ (HTTPS REST /api)
[AWS Lambda Function URL / API Gateway HTTP API]
       │
       ▼ (Event routing via Mangum ASGI)
[FastAPI Serverless Application]
  ├── 8 Deterministic Analysis & Rehearsal Tools
  └── Bedrock Converse API Agent Loop
       │
       ▼ (Converse API / ToolConfig)
[Amazon Bedrock Runtime] (`amazon.nova-lite-v1:0`)
```

### Key Architectural Decisions:
1. **Amazon Bedrock Foundation Model:**
   - Model: `amazon.nova-lite-v1:0`
   - Verified in `us-east-1` with 4-second latency and multi-turn tool calling via Converse API.
   - Zero infrastructure management, pay-per-token inference.
2. **Backend Compute:**
   - AWS Lambda (Python 3.12 runtime, 512 MB memory, 60s timeout).
   - Mangum adapter for FastAPI ASGI routing.
   - Public Lambda Function URL with native CORS support (`authType=NONE`) or API Gateway HTTP API.
3. **Frontend Hosting:**
   - Dedicated S3 bucket: `faultline-app-237657481511-us-east-1` configured for Static Website Hosting.
   - Static assets built via Vite (`index.html`, CSS, JS bundles).
4. **Data Isolation:**
   - In-memory reproducible sandbox registry. No DynamoDB or persistent external database needed, preventing lingering data corruption and extra cloud costs.

---

## 2. Resources to Be Created

| Resource | Service | Identifier / Name | Configuration |
|---|---|---|---|
| **IAM Execution Role** | IAM | `faultline-lambda-role` | `AWSLambdaBasicExecutionRole` + `bedrock:InvokeModel` least privilege |
| **Backend Compute** | AWS Lambda | `faultline-backend-api` | Python 3.12, 512 MB RAM, 60s timeout |
| **Backend Public Endpoint** | Lambda Function URL | Native HTTPS URL | CORS enabled (`*` allowed origins, `GET/POST/OPTIONS`) |
| **Frontend Storage** | Amazon S3 | `faultline-app-237657481511-us-east-1` | Static website hosting, `index.html` error/index document |
| **CloudWatch Logs** | CloudWatch | `/aws/lambda/faultline-backend-api` | 7-day retention for inspection and debugging |

---

## 3. Cost Analysis & Recurring Charges

### A. Compute & Storage (AWS Free Tier Eligible)
* **AWS Lambda:**
  - Free Tier: 1,000,000 free requests per month and 3,200,000 seconds of compute time.
  - Typical Fire Drill: 1 execution (~5-8 seconds duration @ 512 MB).
  - Estimated Monthly Cost: **$0.00** (Comfortably within Free Tier).
* **Amazon S3:**
  - Storage: < 10 MB total frontend bundle size.
  - Free Tier: 5 GB Standard Storage.
  - Estimated Monthly Cost: **$0.00**.
* **CloudWatch Logs:**
  - Ingestion: < 5 MB logs per rehearsal run. Free Tier: 5 GB log data.
  - Estimated Monthly Cost: **$0.00**.

### B. Amazon Bedrock Model Inference (`amazon.nova-lite-v1:0`)
* **Pricing Structure (US East):**
  - Input: $0.00006 per 1,000 input tokens ($0.06 per million tokens).
  - Output: $0.00024 per 1,000 output tokens ($0.24 per million tokens).
* **Per-Rehearsal Inference Consumption:**
  - 5-6 tool rounds per full fire drill investigation.
  - Input tokens per drill: ~3,500 tokens = $0.00021.
  - Output tokens per drill: ~800 tokens = $0.00019.
  - Total inference cost per Fire Drill: **~$0.00040 (less than 1/20th of a single cent!)**.
  - 100 complete fire drills = **~$0.04 USD**.

### Total Projected Monthly Run Cost:
**< $0.10 USD** (Virtually Zero).

---

## 4. Public Endpoints & Security Controls

1. **Least Privilege IAM:**
   - IAM role allows only `bedrock:InvokeModel` scoped to Bedrock foundation models and CloudWatch logging.
   - No permissions granted to access account credentials, billing, DynamoDB, VPC, or IAM modification.
2. **Input Sanitation & Strict Tool Schemas:**
   - All tool arguments validated via Pydantic schemas.
   - Scenario IDs restricted to validated allowlist (`scenario_fintech`, `scenario_healthcare`, `scenario_edtech`).
   - Arbitrary command execution (bash, SQL, shell) is strictly barred at the dispatcher layer.
3. **Data Privacy & Synthetic Data Boundary:**
   - 100% synthetic fixtures. Zero real customer PII, PHI, or payment tokens.
   - No persistent user data logging.

---

## 5. Teardown & Resource Cleanup Commands

To permanently delete all deployed AWS resources and prevent any ongoing risk:

```bash
# 1. Delete Lambda Function URL and Function
aws lambda delete-function-url-config --function-name faultline-backend-api --region us-east-1
aws lambda delete-function --function-name faultline-backend-api --region us-east-1

# 2. Empty and Delete S3 Frontend Bucket
aws s3 rm s3://faultline-app-237657481511-us-east-1 --recursive --region us-east-1
aws s3 rb s3://faultline-app-237657481511-us-east-1 --region us-east-1

# 3. Delete IAM Role & Policies
aws iam delete-role-policy --role-name faultline-lambda-role --policy-name FaultlineBedrockAccess
aws iam detach-role-policy --role-name faultline-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name faultline-lambda-role

# 4. Delete CloudWatch Log Group
aws logs delete-log-group --log-group-name /aws/lambda/faultline-backend-api --region us-east-1
```
