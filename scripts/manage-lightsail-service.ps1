# AWS Lightsail Container Service Management Script for PowerShell
# This script provides common management operations for the container service

param(
    [string]$AWSProfile = "admin-ai-teacher",
    [string]$Region = "eu-central-1",
    [string]$ServiceName = "ai-teacher-dev-frontend",
    [string]$ContainerName = "ai-teacher-frontend-app",
    [Parameter(Mandatory=$true)]
    [ValidateSet("status", "logs", "stop", "start", "restart", "url", "scale")]
    [string]$Action
)

function Show-Status {
    Write-Host "Getting container service status..." -ForegroundColor Yellow
    aws lightsail get-container-services --service-name $ServiceName --profile $AWSProfile --region $Region
}

function Show-Logs {
    Write-Host "Getting container logs..." -ForegroundColor Yellow
    aws lightsail get-container-log --service-name $ServiceName --container-name $ContainerName --profile $AWSProfile --region $Region
}

function Stop-Service {
    Write-Host "Stopping container service..." -ForegroundColor Yellow
    aws lightsail update-container-service --service-name $ServiceName --power "nano" --scale 0 --profile $AWSProfile --region $Region
}

function Start-Service {
    Write-Host "Starting container service..." -ForegroundColor Yellow
    aws lightsail update-container-service --service-name $ServiceName --power "nano" --scale 1 --public-endpoint containerPort=3000,containerName=$ContainerName,healthCheckPath="/api/health" --profile $AWSProfile --region $Region
}

function Restart-Service {
    Write-Host "Restarting container service..." -ForegroundColor Yellow
    Stop-Service
    Start-Sleep -Seconds 10
    Start-Service
}

function Get-Url {
    Write-Host "Getting service URL..." -ForegroundColor Yellow
    $url = aws lightsail get-container-services --service-name $ServiceName --profile $AWSProfile --region $Region --query "containerServices[0].url" --output text
    Write-Host "Service URL: $url" -ForegroundColor Cyan
}

function Set-Scale {
    param([int]$ScaleCount)
    Write-Host "Scaling container service to $ScaleCount instances..." -ForegroundColor Yellow
    aws lightsail update-container-service --service-name $ServiceName --power "nano" --scale $ScaleCount --profile $AWSProfile --region $Region
}

switch ($Action) {
    "status" { Show-Status }
    "logs" { Show-Logs }
    "stop" { Stop-Service }
    "start" { Start-Service }
    "restart" { Restart-Service }
    "url" { Get-Url }
    "scale" { 
        $scaleCount = Read-Host "Enter number of instances (1-10)"
        Set-Scale -ScaleCount $scaleCount
    }
}
