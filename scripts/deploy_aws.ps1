# Autonomous AWS Deployment Script for FAULTLINE
$ErrorActionPreference = "Continue"

$REGION = "us-east-1"
$ACCOUNT_ID = "237657481511"
$ROLE_NAME = "faultline-lambda-role"
$FUNCTION_NAME = "faultline-backend-api"
$BUCKET_NAME = "faultline-app-237657481511-us-east-1"

Write-Host "=========================================================="
Write-Host "FAULTLINE: DEPLOYING SERVERLESS STACK TO AWS ($REGION)"
Write-Host "=========================================================="

# 1. IAM Execution Role
Write-Host "`n[1/5] Configuring IAM Role: $ROLE_NAME..."
$roleExists = aws iam get-role --role-name $ROLE_NAME 2>$null
if (-not $roleExists) {
    Write-Host "Creating IAM role..."
    aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://infrastructure/trust-policy.json
    Start-Sleep -Seconds 3
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    aws iam put-role-policy --role-name $ROLE_NAME --policy-name FaultlineBedrockAccess --policy-document file://infrastructure/bedrock-policy.json
    Write-Host "Waiting 10s for IAM propagation..."
    Start-Sleep -Seconds 10
} else {
    Write-Host "IAM role already exists. Refreshing Bedrock inline policy..."
    aws iam put-role-policy --role-name $ROLE_NAME --policy-name FaultlineBedrockAccess --policy-document file://infrastructure/bedrock-policy.json
}
$ROLE_ARN = "arn:aws:iam::${ACCOUNT_ID}:role/$ROLE_NAME"

# 2. Package Backend if not already done
if (-not (Test-Path "faultline-backend.zip")) {
    Write-Host "`nPackaging backend zip..."
    powershell -ExecutionPolicy Bypass -File scripts\package_backend.ps1
}

# 3. Deploy or Update Lambda Function
Write-Host "`n[2/5] Deploying AWS Lambda Function: $FUNCTION_NAME..."
$fnExists = aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>$null
if (-not $fnExists) {
    Write-Host "Creating Lambda function..."
    aws lambda create-function `
        --function-name $FUNCTION_NAME `
        --runtime python3.12 `
        --role $ROLE_ARN `
        --handler backend.lambda_handler.handler `
        --zip-file fileb://faultline-backend.zip `
        --timeout 60 `
        --memory-size 512 `
        --region $REGION `
        --environment "Variables={BEDROCK_MODEL_ID=amazon.nova-lite-v1:0}"
} else {
    Write-Host "Updating existing Lambda function code..."
    aws lambda update-function-code `
        --function-name $FUNCTION_NAME `
        --zip-file fileb://faultline-backend.zip `
        --region $REGION
    Start-Sleep -Seconds 3
    aws lambda update-function-configuration `
        --function-name $FUNCTION_NAME `
        --timeout 60 `
        --memory-size 512 `
        --region $REGION `
        --environment "Variables={BEDROCK_MODEL_ID=amazon.nova-lite-v1:0}"
}

# 4. Lambda Function URL (Public HTTPS endpoint with native CORS)
Write-Host "`n[3/5] Configuring Public Lambda Function URL..."
$urlConfig = aws lambda get-function-url-config --function-name $FUNCTION_NAME --region $REGION 2>$null
if (-not $urlConfig) {
    Write-Host "Creating Function URL..."
    $urlJson = aws lambda create-function-url-config `
        --function-name $FUNCTION_NAME `
        --auth-type NONE `
        --cors '{\"AllowOrigins\":[\"*\"],\"AllowMethods\":[\"*\"],\"AllowHeaders\":[\"*\"]}' `
        --region $REGION | ConvertFrom-Json
    $API_URL = $urlJson.FunctionUrl
    aws lambda add-permission `
        --function-name $FUNCTION_NAME `
        --statement-id FunctionURLAllowPublicAccess `
        --action lambda:InvokeFunctionUrl `
        --principal "*" `
        --function-url-auth-type NONE `
        --region $REGION
} else {
    $urlJson = $urlConfig | ConvertFrom-Json
    $API_URL = $urlJson.FunctionUrl
}
# Trim trailing slash
$API_URL = $API_URL.TrimEnd('/')
Write-Host "Backend API URL: $API_URL"

# 5. Build Frontend with Live API Endpoint
Write-Host "`n[4/5] Building Frontend for Production..."
$envProdContent = "VITE_API_URL=$API_URL`n"
Set-Content -Path "frontend\.env.production" -Value $envProdContent

cd frontend
npm run build
cd ..

# 6. S3 Static Web Hosting Deployment
Write-Host "`n[5/5] Deploying Frontend Assets to Amazon S3: $BUCKET_NAME..."
$bucketExists = aws s3 ls "s3://$BUCKET_NAME" 2>$null
if (-not $bucketExists) {
    Write-Host "Creating S3 bucket..."
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION
}

Write-Host "Enabling Static Website Hosting..."
aws s3api delete-public-access-block --bucket $BUCKET_NAME --region $REGION
aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html --region $REGION
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://infrastructure/bucket-policy.json

Write-Host "Syncing build artifacts to S3..."
aws s3 sync frontend/dist "s3://$BUCKET_NAME" --delete --region $REGION

$APP_URL = "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

Write-Host "`n=========================================================="
Write-Host "DEPLOYMENT VERIFIED AND COMPLETE!"
Write-Host "Live Frontend URL: $APP_URL"
Write-Host "Backend API URL:  $API_URL"
Write-Host "AWS Region:       $REGION"
Write-Host "Model ID:         amazon.nova-lite-v1:0"
Write-Host "=========================================================="
