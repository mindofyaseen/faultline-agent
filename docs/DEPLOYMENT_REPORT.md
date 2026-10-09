# FAULTLINE — Production AWS Deployment Report

**Deployment Date:** October 9, 2026  
**AWS Account ID:** `237657481511`  
**Deploying Principal:** `arn:aws:iam::237657481511:user/yaseen-cli`  
**Region:** `us-east-1` (US East - N. Virginia)  
**Deployment Status:** **LIVE & VERIFIED OPERATIONAL**  

---

## 1. Verified Live Public URLs

* **Public Web Application (Frontend):**  
  [http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com](http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com)

* **Public REST API (Amazon API Gateway HTTP API):**  
  `https://82ixszzwmd.execute-api.us-east-1.amazonaws.com`

* **Health Check URL:**  
  `https://82ixszzwmd.execute-api.us-east-1.amazonaws.com/api/health`

---

## 2. Infrastructure Inventory

| Service | Resource Name / ID | Configuration | Status |
|---|---|---|---|
| **Amazon S3** | `faultline-app-237657481511-us-east-1` | Static Website Hosting (`index.html`), Public Read Policy | Active |
| **Amazon API Gateway** | `faultline-http-api` (`82ixszzwmd`) | HTTP API, `$default` route integrated with Lambda, CORS enabled | Active |
| **AWS Lambda** | `faultline-backend-api` | Python 3.12 (x86_64), 512 MB, 60s timeout, Mangum ASGI Handler | Active |
| **Amazon Bedrock** | `amazon.nova-lite-v1:0` | Foundation model inference via Bedrock Converse API with registered toolConfig | Active & Authorized |
| **IAM Execution Role** | `faultline-lambda-role` | `AWSLambdaBasicExecutionRole` + Scoped `bedrock:InvokeModel` inline policy | Active |
| **Amazon CloudWatch** | `/aws/lambda/faultline-backend-api` | Standard execution and trace logs | Active |

---

## 3. Deployment Artifacts

1. **Backend Lambda Zip:**
   - Artifact: `faultline-backend.zip` (5.39 MB)
   - Contains: FastAPI application, Mangum adapter, 8 deterministic tools, Bedrock Converse agent harness, Linux manylinux2014_x86_64 binary wheels (`pydantic-core`, `fastapi`, etc.).
2. **Frontend Distribution:**
   - Bundler: Vite 5 + TypeScript + React 18
   - HTML: `dist/index.html` (1.37 KB)
   - CSS: `dist/assets/index-qHhYQDdu.css` (7.36 KB)
   - JS: `dist/assets/index-Bj0h6vAP.js` (182.85 KB)
   - Synced to S3 with `--delete` flag.

---

## 4. End-to-End Live Verification Proof

```bash
$ curl -s https://82ixszzwmd.execute-api.us-east-1.amazonaws.com/api/health
{
  "status": "HEALTHY",
  "service": "FAULTLINE Data Resilience Engine",
  "version": "1.0.0",
  "aws_region": "us-east-1",
  "model_id": "amazon.nova-lite-v1:0",
  "principle": "EVIDENCE, NOT VIBES"
}

$ curl -s https://82ixszzwmd.execute-api.us-east-1.amazonaws.com/api/scenarios
{
  "scenarios": [
    {"id": "scenario_fintech", "title": "The Double-Charge Mirage", "domain": "Fintech / Payment Processing"},
    {"id": "scenario_healthcare", "title": "The Timestamp That Moved the Day", "domain": "Healthcare / Appointment Scheduling"},
    {"id": "scenario_edtech", "title": "The Missing Learning Events", "domain": "EdTech / LMS Event Stream"}
  ]
}
```

---

## 5. Teardown Instructions

To clean up resources completely:
```bash
aws apigatewayv2 delete-api --api-id 82ixszzwmd --region us-east-1
aws lambda delete-function --function-name faultline-backend-api --region us-east-1
aws s3 rm s3://faultline-app-237657481511-us-east-1 --recursive --region us-east-1
aws s3 rb s3://faultline-app-237657481511-us-east-1 --region us-east-1
aws iam delete-role-policy --role-name faultline-lambda-role --policy-name FaultlineBedrockAccess
aws iam detach-role-policy --role-name faultline-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name faultline-lambda-role
```
