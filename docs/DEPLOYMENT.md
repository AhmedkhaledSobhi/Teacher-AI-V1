# AWS Lightsail Container Service Deployment Guide

This guide explains how to deploy the AI Teacher application to AWS Lightsail Container Service.

## Prerequisites

- AWS CLI installed and configured
- Docker installed and running
- AWS profile configured with appropriate permissions
- GitHub repository with secrets configured

## AWS Profile Configuration

Make sure your AWS profile is configured:

```bash
aws configure --profile your-profile-name
```

Required credentials:

- AWS Access Key ID
- AWS Secret Access Key
- Default region: `eu-central-1`

**Note**: Update the profile name in the PowerShell scripts to match your configured profile.

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `NEXTAUTH_SECRET`: Your NextAuth secret key
- `DATABASE_URL_DEV`: Your external database connection string

## Deployment Steps

### 1. Initial Setup (One-time)

```powershell
# Create the container service and ECR repository
.\scripts\setup-lightsail-service.ps1
```

### 2. Manual Deployment

```powershell
# Deploy the application
.\scripts\deploy-to-lightsail.ps1
```

### 3. Automated Deployment

The GitHub Actions workflow will automatically deploy when you push to the `main` branch.

## Environment Variables

Set these environment variables in AWS Lightsail Container Service:

```bash
# Database (EXTERNAL - not in Lightsail)
DATABASE_URL=postgresql://username:password@your-external-db-host:5432/ai_teacher
# Example: postgresql://admin:mypassword@mydb.amazonaws.com:5432/ai_teacher

# NextAuth
NEXTAUTH_URL=https://dev.yatalb.com
NEXTAUTH_SECRET=MTNvexhXZuFuHMT8KEqw5yOkNBiysDnsDOLSiNt4GZM=

# Application
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://drsi.ai
BACKEND_URL=https://drsi.ai
API_URL=https://dev.yatalb.com/api
```

## Container Configuration

- **Service Name**: `ai-teacher-dev-frontend`
- **Region**: `eu-central-1`
- **Power**: ⚠️ **micro (1 GB RAM, 1 vCPU) or small (2 GB RAM, 2 vCPU)** - nano (512MB) is insufficient
- **Scale**: 1 instance
- **Port**: 3000
- **Health Check**: HTTP GET `/api/health` (configured in Lightsail console)
- **Database**: External PostgreSQL (not included in Lightsail container)

### ⚠️ **IMPORTANT: Memory Requirements**

- **Minimum**: 1GB RAM (micro instance)
- **Recommended**: 2GB RAM (small instance)
- **Why**: Next.js with Turbopack requires 1-2GB RAM to compile and run
- **Cost**: Micro ~$10/month, Small ~$20/month

## Monitoring

- **Health Check URL**: `https://your-service-url/api/health`
- **Container Logs**: Available in AWS Lightsail Console
- **Metrics**: CPU, Memory, and Network usage

## Troubleshooting

### Common Issues

1. **Container fails to start / keeps restarting**

   - **Cause**: Insufficient memory (nano instance = 512MB)
   - **Solution**: Upgrade to micro (1GB) or small (2GB) instance
   - **Check**: View container logs for OOM (Out of Memory) errors
   - **Verify**: `docker stats` or Lightsail metrics show memory at 99-100%

2. **Health check fails**

   - **Cause**: Using CMD-based health check with distroless image (no curl)
   - **Solution**: Use HTTP health check in Lightsail console instead
   - **Path**: Configure health check path as `/api/health` in Lightsail
   - **Note**: Distroless images don't include shell or curl for security

3. **Database connection issues**

   - **Cause**: DATABASE_URL points to `ai-teacher-db` (only exists in local Docker)
   - **Solution**: Update DATABASE_URL to point to external database (RDS, etc.)
   - **Format**: `postgresql://username:password@external-db-host:5432/database`
   - **Verify**: Ensure database is accessible from Lightsail container

4. **Application compiles but crashes after startup**

   - **Cause**: Memory limit too low for Next.js runtime
   - **Solution**: Increase to minimum 1GB, recommended 2GB
   - **Check**: Monitor memory usage in Lightsail metrics

5. **Docker build fails at `npm ci` (lockfile mismatch)**
   - **Cause**: `package-lock.json` is out of sync with `package.json` (for example only one file was committed)
   - **Solution**: On a clean branch, run `npm install`, then commit **`package.json`** and **`package-lock.json`** together. For local workflow and Husky hooks that help keep the lockfile updated, see **Git hooks and package-lock** in the [README](../README.md#git-hooks-and-package-lock).

### Useful Commands

```powershell
# Check container service status
.\scripts\manage-lightsail-service.ps1 -Action status

# View container logs
.\scripts\manage-lightsail-service.ps1 -Action logs

# Get service URL
.\scripts\manage-lightsail-service.ps1 -Action url
```

## Cost Optimization

- **Power**: Use `nano` for development, `micro` for production
- **Scale**: Start with 1 instance, scale up as needed
- **Storage**: Monitor container image size
- **Networking**: Use public endpoints only when necessary

## Security Considerations

- Use strong database passwords
- Rotate NEXTAUTH_SECRET regularly
- Enable HTTPS with custom domain
- Monitor container logs for security issues
- Keep container images updated
