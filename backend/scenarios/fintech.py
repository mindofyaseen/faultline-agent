"""
Scenario A: The Double-Charge Mirage
Domain: Fintech payment-event processing.
Pipeline is green, but duplicate events silently inflate settlement balances.
"""

from typing import Dict, List, Any, Tuple
from backend.scenarios.base import (
    ScenarioDefinition,
    PipelineStage,
    InvariantRule,
    Guardrail,
    EvidenceItem,
    DownstreamImpact,
)

# 10 Baseline Synthetic Transactions
BASELINE_PAYMENTS: List[Dict[str, Any]] = [
    {"transaction_id": "txn_101", "account_id": "acc_alpha", "amount": 150.00, "currency": "USD", "timestamp": "2026-10-10T09:00:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_102", "account_id": "acc_bravo", "amount": 85.50, "currency": "USD", "timestamp": "2026-10-10T09:05:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_103", "account_id": "acc_charlie", "amount": 210.00, "currency": "USD", "timestamp": "2026-10-10T09:10:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_104", "account_id": "acc_delta", "amount": 45.00, "currency": "USD", "timestamp": "2026-10-10T09:15:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_105", "account_id": "acc_echo", "amount": 320.00, "currency": "USD", "timestamp": "2026-10-10T09:20:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_106", "account_id": "acc_foxtrot", "amount": 95.00, "currency": "USD", "timestamp": "2026-10-10T09:25:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_107", "account_id": "acc_golf", "amount": 160.00, "currency": "USD", "timestamp": "2026-10-10T09:30:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_108", "account_id": "acc_hotel", "amount": 75.00, "currency": "USD", "timestamp": "2026-10-10T09:35:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_109", "account_id": "acc_india", "amount": 100.00, "currency": "USD", "timestamp": "2026-10-10T09:40:00Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_110", "account_id": "acc_juliet", "amount": 184.50, "currency": "USD", "timestamp": "2026-10-10T09:45:00Z", "status": "AUTHORIZED"},
]

# Injected Fault: Duplicated transactions due to network retry storm
FAULT_PAYMENTS: List[Dict[str, Any]] = list(BASELINE_PAYMENTS) + [
    {"transaction_id": "txn_103", "account_id": "acc_charlie", "amount": 210.00, "currency": "USD", "timestamp": "2026-10-10T09:10:02Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_107", "account_id": "acc_golf", "amount": 160.00, "currency": "USD", "timestamp": "2026-10-10T09:30:04Z", "status": "AUTHORIZED"},
    {"transaction_id": "txn_109", "account_id": "acc_india", "amount": 100.00, "currency": "USD", "timestamp": "2026-10-10T09:40:01Z", "status": "AUTHORIZED"},
]


def build_fintech_scenario() -> ScenarioDefinition:
    stages = [
        PipelineStage(
            id="stage_ingest",
            name="Payment Ingestion Gateway",
            description="Consumes raw payment events from payment stream",
            dependencies=[],
            status="HEALTHY",
            runtime_ms=120,
        ),
        PipelineStage(
            id="stage_dedupe",
            name="Idempotency Guard",
            description="Validates transaction uniqueness and filters duplicate client requests",
            dependencies=["stage_ingest"],
            status="HEALTHY",
            runtime_ms=85,
        ),
        PipelineStage(
            id="stage_settlement",
            name="Settlement Batch Aggregator",
            description="Computes merchant settlement batches and total payout liabilities",
            dependencies=["stage_dedupe"],
            status="HEALTHY",
            runtime_ms=210,
        ),
        PipelineStage(
            id="stage_ledger",
            name="Double-Entry Ledger Posting",
            description="Posts balanced debit/credit journal entries to internal ledger",
            dependencies=["stage_settlement"],
            status="HEALTHY",
            runtime_ms=145,
        ),
        PipelineStage(
            id="stage_dashboard",
            name="Executive Treasury Dashboard",
            description="Surfaces real-time liquidity and daily processed volume to risk officers",
            dependencies=["stage_ledger"],
            status="HEALTHY",
            runtime_ms=90,
        ),
    ]

    invariants = [
        InvariantRule(
            id="inv_unique_txn_id",
            name="Transaction Key Uniqueness",
            expression="count(transaction_id) == count(distinct transaction_id)",
            severity="CRITICAL",
            description="Every payment event in the settlement window must have a globally unique transaction ID.",
        ),
        InvariantRule(
            id="inv_settlement_reconciliation",
            name="Settlement Balance Conservation",
            expression="sum(raw_amount) == sum(deduped_amount)",
            severity="CRITICAL",
            description="The gross settlement amount must reconcile exactly with the sum of distinct transactions.",
        ),
        InvariantRule(
            id="inv_currency_uniformity",
            name="Uniform Currency Assertion",
            expression="count(distinct currency) == 1 and currency == 'USD'",
            severity="WARNING",
            description="Batch currency must be uniform USD without unhedged currency drift.",
        ),
    ]

    guardrails = [
        Guardrail(
            id="idempotent_dedupe_on_key",
            name="Key-Based Deduplication (Idempotency Window)",
            strategy="DEDUPLICATE_ON_KEY",
            description="Enforces strict 24-hour key-level deduplication on transaction_id before aggregation.",
            code_summary="records = list({r['transaction_id']: r for r in records}.values())",
        ),
        Guardrail(
            id="quarantine_duplicate_stream",
            name="Dead-Letter Quarantine Route",
            strategy="QUARANTINE_DUPLICATES",
            description="Routes duplicate messages to a secure DLQ for audit while letting first-seen pass.",
            code_summary="valid, dlq = partition(records, is_first_seen_key)",
        ),
    ]

    return ScenarioDefinition(
        id="scenario_fintech",
        title="The Double-Charge Mirage",
        tagline="Duplicate payment events silently inflate settlement liabilities by $470.00.",
        domain="Fintech / Payment Processing",
        description="A network retry storm emits duplicate payment authorization events. Downstream ETL completes with 0 errors (Exit code 0), but merchant payouts are overstated by 32.98%.",
        stages=stages,
        invariants=invariants,
        permitted_faults=["duplicate_retry_storm", "network_replay"],
        available_guardrails=guardrails,
        baseline_records=BASELINE_PAYMENTS,
        fault_records=FAULT_PAYMENTS,
        active_records=list(BASELINE_PAYMENTS),
        state="BASELINE",
    )


def evaluate_fintech_metrics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Pure deterministic calculation of fintech metrics."""
    raw_count = len(records)
    seen_ids = set()
    duplicate_records: List[Dict[str, Any]] = []
    unique_records: List[Dict[str, Any]] = []

    for r in records:
        tx_id = r["transaction_id"]
        if tx_id in seen_ids:
            duplicate_records.append(r)
        else:
            seen_ids.add(tx_id)
            unique_records.append(r)

    unique_count = len(unique_records)
    duplicate_count = len(duplicate_records)

    raw_sum = round(sum(r["amount"] for r in records), 2)
    unique_sum = round(sum(r["amount"] for r in unique_records), 2)
    discrepancy = round(raw_sum - unique_sum, 2)

    return {
        "raw_count": raw_count,
        "unique_count": unique_count,
        "duplicate_count": duplicate_count,
        "duplicate_record_ids": [r["transaction_id"] for r in duplicate_records],
        "raw_sum": raw_sum,
        "unique_sum": unique_sum,
        "discrepancy": discrepancy,
        "is_corrupted": duplicate_count > 0,
    }
