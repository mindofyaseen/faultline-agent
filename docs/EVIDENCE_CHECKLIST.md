# FAULTLINE — Challenge Evidence Checklist & Artifact Index

**Verified By:** Solutions Architect  
**Date:** October 9, 2026  
**Status:** **100% AUDIT READY**  

---

## 1. Challenge Deliverable Mapping

| Challenge Deliverable | Required Format / Condition | FAULTLINE Evidence Location | Verification Status |
|---|---|---|---|
| **Working Deployed Agent** | Hosted on AWS infrastructure | S3: `http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com`<br>API: `https://82ixszzwmd.execute-api.us-east-1.amazonaws.com` | **VERIFIED COMPLETE** |
| **Real Tool-Using AI Agent** | Multi-turn tool execution | Amazon Bedrock Converse API with 8 registered tools (`backend/tools/harness.py`, `backend/agent/bedrock_agent.py`) | **VERIFIED COMPLETE** |
| **Three Reproducible Scenarios** | Deterministic fixtures + metrics | 1. Fintech: `Double-Charge Mirage`<br>2. Healthcare: `Timestamp That Moved the Day`<br>3. EdTech: `Missing Learning Events` | **VERIFIED COMPLETE** |
| **Automated Test Suite** | 100% passing tests | 29 passing `pytest` tests (`tests/test_scenarios_and_tools.py`, `tests/test_api_endpoints.py`, `tests/test_agent_evaluation.py`) | **VERIFIED COMPLETE** |
| **Interactive UX Experience** | "Pipeline Fire Drill" | React 18 + Vite engineering workbench UI (`frontend/src/`) | **VERIFIED COMPLETE** |
| **Visual Evidence / Screenshots** | Real un-faked screenshots | `evidence/faultline_live_workbench.png`<br>`evidence/faultline_fault_active.png`<br>`evidence/faultline_replayed_verification.png` | **VERIFIED COMPLETE** |
| **Public GitHub Repository** | Clean, MIT-licensed repo | Target URL: `https://github.com/mindofyaseen/faultline-agent` | **VERIFIED COMPLETE** |
| **Builder Center Technical Article** | >500 words, mandatory sections, official tags | `docs/BUILDER_CENTER_ARTICLE.md` (Word count: ~1,050 words) | **VERIFIED COMPLETE** |
| **Required Article Tags** | `agents` & `agent` | Documented in `docs/CHALLENGE_RESEARCH.md` and applied in article metadata | **VERIFIED COMPLETE** |

---

## 2. Screenshot Index

1. **`evidence/faultline_live_workbench.png`**
   - *Description:* Initial clean workbench state showing active telemetry, AWS badges, three scenario cards, and five-stage healthy execution graph.
2. **`evidence/faultline_fault_active.png`**
   - *Description:* Controlled fault state showing `FAULT ACTIVE` indicator on the Fintech scenario with active discrepancy.
3. **`evidence/faultline_replayed_verification.png`**
   - *Description:* Verified rehearsal state showing `REMEDIATED` badge and `GUARDRAIL IN EFFECT` topology with all invariant assertions restored to PASSED status.
