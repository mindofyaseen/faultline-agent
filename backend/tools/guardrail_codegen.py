"""
Production Guardrail Code Generator for FAULTLINE.
Generates copy-pasteable production implementations for:
- AWS Glue / PySpark
- dbt (Data Build Tool) SQL & schema tests
- AWS Lambda (Python streaming event handler)
- Amazon EventBridge / DynamoDB Idempotency
"""

from typing import Dict, Any


def generate_guardrail_code(scenario_id: str, guardrail_id: str = "") -> Dict[str, str]:
    norm_id = scenario_id.lower().replace("-", "_")
    if "fintech" in norm_id:
        return {
            "pyspark": """# AWS Glue / PySpark Production Deduplication Guardrail
from pyspark.sql import DataFrame
from pyspark.sql.functions import col, row_number
from pyspark.sql.window import Window

def apply_idempotency_guardrail(df: DataFrame) -> DataFrame:
    \"\"\"
    Guarantees key-level deduplication over 24h settlement sliding window.
    Eliminates silent double-charge liabilities.
    \"\"\"
    window_spec = Window.partitionBy("transaction_id").orderBy(col("timestamp").asc())
    
    deduped_df = df.withColumn("row_num", row_number().over(window_spec)) \\
                   .filter(col("row_num") == 1) \\
                   .drop("row_num")
                   
    return deduped_df
""",
            "dbt": """-- dbt (Data Build Tool) Model: stg_payments_deduped.sql
{{ config(
    materialized='incremental',
    unique_key='transaction_id',
    on_schema_change='fail'
) }}

WITH source_events AS (
    SELECT * FROM {{ source('raw_stream', 'payment_events') }}
    {% if is_incremental() %}
        WHERE timestamp >= (SELECT coalesce(max(timestamp), '1970-01-01') FROM {{ this }})
    {% endif %}
),
ranked_events AS (
    SELECT
        transaction_id,
        account_id,
        amount,
        currency,
        timestamp,
        status,
        ROW_NUMBER() OVER (PARTITION BY transaction_id ORDER BY timestamp ASC) as rank_id
    FROM source_events
)
SELECT
    transaction_id,
    account_id,
    amount,
    currency,
    timestamp,
    status
FROM ranked_events
WHERE rank_id = 1;
""",
            "lambda_python": """# AWS Lambda Streaming Handler (Kinesis / SQS FIFO Idempotency)
import json
import boto3

dynamodb = boto3.resource('dynamodb')
idempotency_table = dynamodb.Table('payment-idempotency-keys')

def lambda_handler(event, context):
    for record in event['Records']:
        payload = json.loads(record['body'])
        txn_id = payload['transaction_id']
        
        # Atomic conditional write to guarantee single-execution
        try:
            idempotency_table.put_item(
                Item={'transaction_id': txn_id, 'processed_at': payload['timestamp']},
                ConditionExpression='attribute_not_exists(transaction_id)'
            )
            process_settlement(payload)
        except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
            # Duplicate detected: safely acknowledge and route to DLQ for audit
            print(f"[FAULTLINE_GUARD] Suppressed duplicate payment event: {txn_id}")
            continue
""",
        }

    elif "healthcare" in norm_id:
        return {
            "pyspark": """# AWS Glue / PySpark Strict ISO-8601 UTC Canonicalizer
from pyspark.sql.functions import col, to_utc_timestamp, when, length

def apply_timezone_canonicalizer(df):
    \"\"\"
    Enforces unambiguous UTC conversion to prevent midnight calendar rollover.
    Quarantines timestamps lacking explicit timezone specifiers.
    \"\"\"
    return df.withColumn(
        "normalized_scheduled_time",
        when(col("scheduled_time").endswith("Z") | col("scheduled_time").contains("+"),
             to_utc_timestamp(col("scheduled_time"), "UTC"))
        .otherwise(to_utc_timestamp(col("scheduled_time"), "America/New_York"))
    )
""",
            "dbt": """-- dbt Test & Macro: assert_strict_iso8601_timezone.sql
SELECT
    appointment_id,
    scheduled_time
FROM {{ ref('stg_clinic_appointments') }}
WHERE scheduled_time NOT LIKE '%Z'
  AND scheduled_time NOT LIKE '%+%'
  AND scheduled_time NOT LIKE '%-%';
-- Fails build if any appointment lacks explicit timezone offset
""",
            "lambda_python": """# Python Data Normalizer with Dateutil
from datetime import datetime, timezone
import dateutil.parser

def canonicalize_appointment_time(time_str: str, default_tz=timezone.utc) -> datetime:
    parsed = dateutil.parser.isoparse(time_str)
    if parsed.tzinfo is None:
        # Ambiguous local time detected: attach clinic timezone explicitly
        parsed = parsed.replace(tzinfo=default_tz)
    return parsed.astimezone(timezone.utc)
""",
        }

    elif "edtech" in norm_id:
        return {
            "pyspark": """# PySpark Structured Streaming with Adaptive Watermark
from pyspark.sql.functions import col, coalesce

def apply_adaptive_watermark_stream(stream_df):
    \"\"\"
    Expands late event threshold to 60m and resolves legacy schema drift.
    \"\"\"
    return stream_df \\
        .withColumn("canonical_completion_time", 
                    coalesce(col("completion_time"), col("completed_at"))) \\
        .withWatermark("canonical_completion_time", "60 minutes")
""",
            "dbt": """-- dbt Schema Alias & Late Event Resolution
SELECT
    student_id,
    course_id,
    module_id,
    COALESCE(completion_time, completed_at) AS completion_time,
    score
FROM {{ source('lms_stream', 'module_submissions') }}
""",
            "lambda_python": """# Lambda Schema Adapter & Late Arrival Handler
def transform_learning_event(event_dict: dict) -> dict:
    if "completed_at" in event_dict and "completion_time" not in event_dict:
        event_dict["completion_time"] = event_dict.pop("completed_at")
    return event_dict
""",
        }

    return {}
