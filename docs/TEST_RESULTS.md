# FAULTLINE — Automated Test Results & Verification Report

**Date of Execution:** October 9, 2026  
**Test Suite:** `pytest` (29 Automated Tests Passed)  
**Execution Environment:** Windows / Python 3.12 / Amazon Bedrock Runtime (`amazon.nova-lite-v1:0`)  
**Pass Rate:** **100% (29/29 Passed)**  

---

## 1. Summary of Execution

```
============================= test session starts =============================
platform win32 -- Python 3.12.3, pytest-9.1.1
rootdir: C:\Users\mindo\Documents\weekend-challenge-aws
configfile: pytest.ini
collected 29 items

tests/test_agent_evaluation.py::test_agent_eval_fintech_diagnosis PASSED         [  3%]
tests/test_agent_evaluation.py::test_agent_eval_healthcare_diagnosis PASSED      [  6%]
tests/test_agent_evaluation.py::test_agent_eval_edtech_diagnosis PASSED          [ 10%]
tests/test_agent_evaluation.py::test_agent_eval_security_jailbreak_attempt PASSED [ 13%]
tests/test_api_endpoints.py::test_health_endpoint PASSED                         [ 17%]
tests/test_api_endpoints.py::test_list_scenarios_endpoint PASSED                 [ 20%]
tests/test_api_endpoints.py::test_get_scenario_detail PASSED                     [ 24%]
tests/test_api_endpoints.py::test_inject_fault_endpoint PASSED                   [ 27%]
tests/test_api_endpoints.py::test_replay_endpoint PASSED                         [ 31%]
tests/test_api_endpoints.py::test_export_report_endpoint PASSED                  [ 34%]
tests/test_api_endpoints.py::test_direct_tool_execute_endpoint PASSED            [ 37%]
tests/test_api_endpoints.py::test_invalid_scenario_404 PASSED                    [ 41%]
tests/test_api_endpoints.py::test_invalid_fault_400 PASSED                       [ 44%]
tests/test_scenarios_and_tools.py::test_scenario_fintech_baseline_passes PASSED [ 48%]
tests/test_scenarios_and_tools.py::test_scenario_healthcare_baseline_passes PASSED [ 51%]
tests/test_scenarios_and_tools.py::test_scenario_edtech_baseline_passes PASSED [ 55%]
tests/test_scenarios_and_tools.py::test_scenario_fintech_fault_detection PASSED [ 58%]
tests/test_scenarios_and_tools.py::test_scenario_healthcare_fault_detection PASSED [ 62%]
tests/test_scenarios_and_tools.py::test_scenario_edtech_fault_detection PASSED [ 65%]
tests/test_scenarios_and_tools.py::test_inspect_evidence_bounded_citations PASSED [ 68%]
tests/test_scenarios_and_tools.py::test_simulate_downstream_impact_quantified PASSED [ 72%]
tests/test_scenarios_and_tools.py::test_fintech_remediation_replay PASSED         [ 75%]
tests/test_scenarios_and_tools.py::test_healthcare_remediation_replay PASSED      [ 79%]
tests/test_scenarios_and_tools.py::test_edtech_remediation_replay PASSED          [ 82%]
tests/test_scenarios_and_tools.py::test_invalid_scenario_id_rejected PASSED      [ 86%]
tests/test_scenarios_and_tools.py::test_invalid_fault_type_rejected PASSED       [ 89%]
tests/test_scenarios_and_tools.py::test_invalid_guardrail_rejected PASSED        [ 93%]
tests/test_scenarios_and_tools.py::test_unknown_tool_rejected PASSED             [ 96%]
tests/test_scenarios_and_tools.py::test_export_incident_report_markdown_and_json PASSED [100%]

======================= 29 passed in 28.68s =======================
```

---

## 2. Requirement-to-Test Traceability Matrix

| Requirement | Test Name | Assertion Verified | Status |
|---|---|---|---|
| 1. Baseline passes expected assertions | `test_scenario_fintech_baseline_passes`, `test_scenario_healthcare_baseline_passes`, `test_scenario_edtech_baseline_passes` | `all_invariants_passed == True` on baseline datasets | **VERIFIED COMPLETE** |
| 2. Seeded fault is detected | `test_scenario_fintech_fault_detection`, `test_scenario_healthcare_fault_detection`, `test_scenario_edtech_fault_detection` | `all_invariants_passed == False` on injected datasets | **VERIFIED COMPLETE** |
| 3. Duplicate key discrepancy quantified | `test_scenario_fintech_fault_detection` | 3 duplicates identified; raw sum $1,895 vs unique $1,425 (+$470.00 discrepancy) | **VERIFIED COMPLETE** |
| 4. Timestamp errors distinguished | `test_scenario_healthcare_fault_detection` | 4 records identified missing explicit UTC offset; Oct 11 spikes to 18 (>16 capacity) | **VERIFIED COMPLETE** |
| 5. Schema changes identified | `test_scenario_edtech_fault_detection` | `completed_at` identified as schema drift; 3 students dropped past 15m watermark | **VERIFIED COMPLETE** |
| 6. Before/after metrics calculated | `test_fintech_remediation_replay`, `test_healthcare_remediation_replay`, `test_edtech_remediation_replay` | Assertions failed before = 2, after = 0 | **VERIFIED COMPLETE** |
| 7. Remediation passes regression | `test_fintech_remediation_replay` | `remediation_status == 'VERIFIED_SUCCESS'` | **VERIFIED COMPLETE** |
| 8. Invalid remediation fails | `test_invalid_guardrail_rejected` | Uncatalogued guardrails rejected | **VERIFIED COMPLETE** |
| 9. Malformed requests rejected | `test_invalid_scenario_404`, `test_invalid_fault_400` | HTTP 404 & HTTP 400 returned cleanly | **VERIFIED COMPLETE** |
| 10. Security jailbreak resistance | `test_agent_eval_security_jailbreak_attempt` | Prompt injection requesting AWS secrets cannot grant arbitrary tool execution | **VERIFIED COMPLETE** |
| 11. Bounded evidence citations | `test_inspect_evidence_bounded_citations` | Record citations bounded to requested limit | **VERIFIED COMPLETE** |
| 12. Valid report exports | `test_export_incident_report_markdown_and_json` | Valid Markdown and JSON schema output | **VERIFIED COMPLETE** |
| 13. Bedrock multi-scenario diagnosis | `test_agent_eval_fintech_diagnosis`, `test_agent_eval_healthcare_diagnosis`, `test_agent_eval_edtech_diagnosis` | Live Converse API executes autonomous multi-turn tool calling | **VERIFIED COMPLETE** |

---

## 3. Live AWS API Gateway Integration Results

The following live automated test script was executed directly against the production AWS deployment:

```bash
Backend Endpoint: https://82ixszzwmd.execute-api.us-east-1.amazonaws.com
Target Model: amazon.nova-lite-v1:0 (Amazon Bedrock)

1. Reset scenario: SUCCESS
2. Inject fault: 3 duplicates detected, $470.00 discrepancy measured.
3. Bedrock Agent Investigation:
   - Engine: BEDROCK_CONVERSE_API
   - Tools Executed: 5
     * Round 1: run_quality_profile
     * Round 2: inspect_evidence
     * Round 3: propose_guardrail
     * Round 4: propose_guardrail
     * Round 5: replay_and_verify
4. Applying guardrail & replay:
   - Status: VERIFIED_SUCCESS
   - Invariants Passed: 3 / 3
   - Invariants Failed: 0
```
