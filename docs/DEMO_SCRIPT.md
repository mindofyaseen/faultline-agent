# FAULTLINE — 90-Second Demonstration Script

**Title:** The Pipeline Fire Drill: Rehearsing Silent Data Failures with Amazon Bedrock  
**Presenter Tone:** Calm, authoritative, technical solutions architect.  
**Theme:** "Evidence, Not Vibes."  

---

## Timeline & Narrative Walkthrough

### 0:00 – 0:15 | The Hook: Silent Pipeline Failures
* **Screen:** Open FAULTLINE workbench at [Live Application URL](http://faultline-app-237657481511-us-east-1.s3-website-us-east-1.amazonaws.com).
* **Narration:**
  > *"Every data engineer has lived this nightmare: your pipeline orchestrator shows green. Exit code zero. Every task succeeded. But downstream, business decisions are corrupted because the data is lying. Silent data downtime costs enterprises millions because standard monitoring checks whether code ran, not whether data is truthful."*

### 0:15 – 0:35 | Introducing FAULTLINE & Scenario Selection
* **Screen:** Point out the three scenario cards: *Double-Charge Mirage*, *Timestamp That Moved the Day*, and *Missing Learning Events*. Select *Double-Charge Mirage*.
* **Narration:**
  > *"Meet FAULTLINE. An evidence-first AI agent built on Amazon Bedrock. Rather than a conversational chatbot that hallucinates suggestions, FAULTLINE is an interactive resilience laboratory. We've loaded 'The Double-Charge Mirage'—a fintech settlement pipeline where network retries duplicate payment events without crashing the ingest stage."*

### 0:35 – 0:55 | The Signature Action: "RUN PIPELINE FIRE DRILL"
* **Screen:** Click the prominent glowing cyan button: **`RUN PIPELINE FIRE DRILL`**.
* **Narration:**
  > *"Watch what happens when we click 'RUN PIPELINE FIRE DRILL'. In an isolated sandbox, FAULTLINE injects the failure. Then, our Amazon Bedrock agent—powered by Amazon Nova Lite through the Bedrock Converse API—autonomously executes registered tools. Look at the live activity feed: it inspects the pipeline, runs a deterministic quality profile, and cites specific duplicate transaction IDs: txn_103, txn_107, and txn_109."*

### 0:55 – 1:15 | Evidence Not Vibes & Downstream Impact
* **Screen:** Scroll down to the Evidence Drawer and Downstream Impact Panel.
* **Narration:**
  > *"Our core principle is 'Evidence, Not Vibes.' Every number you see is calculated by deterministic code. The agent measures a gross settlement discrepancy of positive $470.00—an artificial 32.98% financial overstatement that would cause erroneous payouts. The agent labels this a 'Measured Fact,' not a model hallucination."*

### 1:15 – 1:30 | Safe Remediation Replay & Verification
* **Screen:** Show the Before vs After Replay Verification panel and the Topology glowing cyan with `GUARDRAIL IN EFFECT`.
* **Narration:**
  > *"FAULTLINE doesn't just diagnose; it rehearses the fix. It selected the 'Key-Based Deduplication' guardrail, replayed the synthetic pipeline, and verified that 100% of invariant assertions now pass. Zero duplicates. Discrepancy returns to $0.00. No production data was touched."*

### 1:30 – 1:40 | Incident Report Export & Conclusion
* **Screen:** Click **`Incident Report`**, show the clean Markdown/JSON modal, and display the GitHub repository link.
* **Narration:**
  > *"With one click, engineers can export a complete, verifiable incident report. Deployed serverless on AWS Lambda, API Gateway, S3, and Amazon Bedrock. FAULTLINE: because when your pipeline is green, you need to know if your data is telling the truth."*
