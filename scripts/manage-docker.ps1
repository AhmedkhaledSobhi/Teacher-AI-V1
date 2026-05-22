# Docker Container Management Script for PowerShell
# This script provides common Docker operations for local development

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("up", "down", "build", "logs", "status", "migrate", "shell", "clean")]
    [string]$Action
)

function Start-Containers {
    Write-Host "Starting Docker containers..." -ForegroundColor Yellow
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Containers started successfully" -ForegroundColor Green
        Show-ContainerStatus
    } else {
        Write-Host "Error starting containers" -ForegroundColor Red
    }
}

function Stop-Containers {
    Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Containers stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "Error stopping containers" -ForegroundColor Red
    }
}

function Build-Containers {
    Write-Host "Building Docker containers..." -ForegroundColor Yellow
    docker-compose up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Containers built and started successfully" -ForegroundColor Green
    } else {
        Write-Host "Error building containers" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host "Showing container logs..." -ForegroundColor Yellow
    docker-compose logs -f
}

function Show-ContainerStatus {
    Write-Host "Container Status:" -ForegroundColor Cyan
    docker-compose ps
}

function Run-Migrations {
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 10
    docker-compose exec app npx prisma migrate dev --name "update"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migrations completed successfully" -ForegroundColor Green
    } else {
        Write-Host "Error running migrations" -ForegroundColor Red
    }
}

function Open-Shell {
    Write-Host "Opening shell in app container..." -ForegroundColor Yellow
    docker-compose exec app sh
}

function Clean-Containers {
    Write-Host "Cleaning up Docker containers and volumes..." -ForegroundColor Yellow
    docker-compose down -v
    docker system prune -f
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Cleanup completed successfully" -ForegroundColor Green
    } else {
        Write-Host "Error during cleanup" -ForegroundColor Red
    }
}

switch ($Action) {
    "up" { Start-Containers }
    "down" { Stop-Containers }
    "build" { Build-Containers }
    "logs" { Show-Logs }
    "status" { Show-ContainerStatus }
    "migrate" { Run-Migrations }
    "shell" { Open-Shell }
    "clean" { Clean-Containers }
}
