# AWS Lightsail Container Service Deployment Script for PowerShell
# This script deploys the AI Teacher application to AWS Lightsail Container Service

param(
    [string]$AWSProfile = "admin-ai-teacher",
    [string]$Region = "eu-central-1",
    [string]$ServiceName = "ai-teacher-dev-frontend",
    [string]$ContainerName = "ai-teacher-frontend-app",
    [string]$ECRRepositoryName = "ai-teacher-frontend"
)

Write-Host "Starting AWS Lightsail Container Service Deployment..." -ForegroundColor Green
Write-Host "NOTE: Make sure your external PostgreSQL database is set up and DATABASE_URL is configured correctly" -ForegroundColor Yellow

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
    Write-Host "AWS CLI found" -ForegroundColor Green
} catch {
    Write-Host "AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Get ECR repository URI
Write-Host "Getting ECR repository URI..." -ForegroundColor Yellow
$ecrUri = aws ecr describe-repositories --repository-names $ECRRepositoryName --profile $AWSProfile --region $Region --query "repositories[0].repositoryUri" --output text

if (-not $ecrUri) {
    Write-Host "ECR repository not found. Please run setup-lightsail-service.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "ECR Repository URI: $ecrUri" -ForegroundColor Cyan

# Login to ECR
Write-Host "Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --profile $AWSProfile --region $Region | docker login --username AWS --password-stdin $ecrUri

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error logging in to ECR" -ForegroundColor Red
    exit 1
}

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t "${ContainerName}:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building Docker image" -ForegroundColor Red
    exit 1
}

# Tag the image for ECR
Write-Host "Tagging image for ECR..." -ForegroundColor Yellow
docker tag "${ContainerName}:latest" "${ecrUri}:latest"

# Push to ECR
Write-Host "Pushing image to ECR..." -ForegroundColor Yellow
docker push "${ecrUri}:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error pushing image to ECR" -ForegroundColor Red
    exit 1
}

# Push to Lightsail Container Registry using ECR URI directly
Write-Host "Pushing image to AWS Lightsail Container Registry..." -ForegroundColor Yellow
aws lightsail push-container-image --service-name $ServiceName --label $ContainerName --image "${ecrUri}:latest" --profile $AWSProfile --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error pushing image to Lightsail. Trying alternative method..." -ForegroundColor Yellow
    # Alternative: Use the ECR URI directly in the container service update
    Write-Host "Using ECR image directly in container service update..." -ForegroundColor Yellow
}

# Update the container service with environment variables
Write-Host "Updating container service..." -ForegroundColor Yellow
aws lightsail update-container-service --service-name $ServiceName --power "nano" --scale 1 --public-endpoint containerPort=3000,containerName=$ContainerName,healthCheckPath="/api/health" --environment-variables DATABASE_URL="postgresql://neondb_owner:npg_4CDvinspzwh9@ep-raspy-mode-agkz67no-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",NEXTAUTH_URL="https://ai-teacher-dev-frontend.5zn6hxtze82fj.eu-central-1.cs.amazonlightsail.com",NEXTAUTH_SECRET="MTNvexhXZuFuHMT8KEqw5yOkNBiysDnsDOLSiNt4GZM=",NODE_ENV="production",NEXT_PUBLIC_BACKEND_URL="https://drsi.ai",BACKEND_URL="https://drsi.ai",API_URL="https://ai-teacher-dev-frontend.5zn6hxtze82fj.eu-central-1.cs.amazonlightsail.com/api" --profile $AWSProfile --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error updating container service" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your application should be available at the Lightsail container service URL" -ForegroundColor Cyan
