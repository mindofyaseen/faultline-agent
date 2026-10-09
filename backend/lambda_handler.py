"""
AWS Lambda entrypoint for FAULTLINE.
Uses Mangum adapter to route API Gateway HTTP API events through the FastAPI app.
"""

from mangum import Mangum
from backend.main import app

# Lambda handler callable by AWS Lambda runtime
handler = Mangum(app, lifespan="off")
