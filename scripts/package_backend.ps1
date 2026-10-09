# Packaging script for FAULTLINE backend Lambda with Linux x86_64 binary wheels

$buildDir = "build_lambda"
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
}
New-Item -ItemType Directory -Path $buildDir

Write-Host "Installing Linux manylinux Lambda dependencies..."
.\.venv\Scripts\pip install --platform manylinux2014_x86_64 --only-binary=:all: --python-version 312 --target $buildDir --upgrade fastapi pydantic pydantic-core mangum python-dateutil starlette typing-extensions annotated-types anyio idna

Write-Host "Copying backend application code..."
Copy-Item -Recurse -Path backend -Destination "$buildDir\backend"

Write-Host "Creating deployment zip..."
if (Test-Path "faultline-backend.zip") {
    Remove-Item "faultline-backend.zip"
}
Compress-Archive -Path "$buildDir\*" -DestinationPath "faultline-backend.zip" -Force

$zipSize = (Get-Item "faultline-backend.zip").Length / 1MB
Write-Host ("Packaged successfully for AWS Lambda Linux: faultline-backend.zip ({0:N2} MB)" -f $zipSize)
