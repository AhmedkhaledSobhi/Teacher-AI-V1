# AWS Lightsail Container Service Setup Script for PowerShell
# This script sets up the initial container service in AWS Lightsail

param(
    [string]$AWSProfile = "admin-ai-teacher",
    [string]$Region = "eu-central-1",
    [string]$ServiceName = "ai-teacher-dev-frontend",
    [string]$ECRRepositoryName = "ai-teacher-frontend"
)

Write-Host "Setting up AWS Lightsail Container Service..." -ForegroundColor Green

# Create ECR repository
Write-Host "Creating ECR repository..." -ForegroundColor Yellow
try {
    aws ecr create-repository --repository-name $ECRRepositoryName --profile $AWSProfile --region $Region
    Write-Host "ECR repository created successfully" -ForegroundColor Green
} catch {
    Write-Host "ECR repository may already exist or error occurred" -ForegroundColor Yellow
}

# Create IAM role for Lightsail Container Service
Write-Host "Creating IAM role for Lightsail Container Service..." -ForegroundColor Yellow
$roleName = "LightsailContainerServiceRole-$ServiceName"

# Create trust policy for Lightsail
$trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lightsail.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@

# Create ECR access policy
$ecrPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
"@

try {
    # Create the role
    aws iam create-role --role-name $roleName --assume-role-policy-document $trustPolicy --profile $AWSProfile --region $Region | Out-Null
    
    # Create and attach the policy
    aws iam put-role-policy --role-name $roleName --policy-name ECRAccessPolicy --policy-document $ecrPolicy --profile $AWSProfile --region $Region
    
    Write-Host "IAM role created successfully" -ForegroundColor Green
} catch {
    Write-Host "IAM role may already exist or error occurred" -ForegroundColor Yellow
}

# Get ECR login token
Write-Host "Getting ECR login token..." -ForegroundColor Yellow
$ecrLogin = aws ecr get-login-password --profile $AWSProfile --region $Region

# Create container service
Write-Host "Creating container service..." -ForegroundColor Yellow
aws lightsail create-container-service --service-name $ServiceName --power "nano" --scale 1 --tags key=Environment,value=Development key=Project,value=AI-Teacher --profile $AWSProfile --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error creating container service" -ForegroundColor Red
    exit 1
}

# Wait for service to be ready
Write-Host "Waiting for container service to be ready..." -ForegroundColor Yellow
aws lightsail wait container-service-ready --service-name $ServiceName --profile $AWSProfile --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error waiting for container service to be ready" -ForegroundColor Red
    exit 1
}

Write-Host "Container service created successfully!" -ForegroundColor Green

# Get service URL
Write-Host "Service URL:" -ForegroundColor Cyan
$serviceUrl = aws lightsail get-container-services --service-name $ServiceName --profile $AWSProfile --region $Region --query "containerServices[0].url" --output text
Write-Host $serviceUrl -ForegroundColor White

# Get ECR repository URI
Write-Host "ECR Repository URI:" -ForegroundColor Cyan
$ecrUri = aws ecr describe-repositories --repository-names $ECRRepositoryName --profile $AWSProfile --region $Region --query "repositories[0].repositoryUri" --output text
Write-Host $ecrUri -ForegroundColor White

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "You can now use deploy-to-lightsail.ps1 to deploy your application" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Before deploying, make sure to:" -ForegroundColor Yellow
Write-Host "1. Set up your external PostgreSQL database" -ForegroundColor Yellow
Write-Host "2. Update the DATABASE_URL environment variable in your deployment" -ForegroundColor Yellow
Write-Host "3. The DATABASE_URL should point to your external database (not localhost)" -ForegroundColor Yellow
