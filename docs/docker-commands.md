# Docker Compose Commands for AI Teacher Application

## Development Commands

### Start the application
```bash
docker-compose up -d
```

### Start with logs
```bash
docker-compose up
```

### Stop the application
```bash
docker-compose down
```

### Stop and remove volumes (WARNING: This will delete all data)
```bash
docker-compose down -v
```

### Rebuild containers
```bash
docker-compose up --build
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs postgres
```

### Execute commands in containers
```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate dev

# Generate Prisma client
docker-compose exec app npx prisma generate

# Access PostgreSQL shell
docker-compose exec postgres psql -U admin -d ai_teacher

# Access app container shell
docker-compose exec app sh
```

## Database Commands

### Reset database
```bash
docker-compose exec app npx prisma migrate reset
```

### Deploy migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### Seed database
```bash
docker-compose exec app npx prisma db seed
```

## Production Commands

### Build for production
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Scale services
```bash
docker-compose up --scale app=3
```

## PowerShell Scripts

For easier management, use the provided PowerShell scripts:

```powershell
# Start containers
.\scripts\manage-docker.ps1 -Action up

# Stop containers
.\scripts\manage-docker.ps1 -Action down

# Build containers
.\scripts\manage-docker.ps1 -Action build

# Run migrations
.\scripts\manage-docker.ps1 -Action migrate

# View logs
.\scripts\manage-docker.ps1 -Action logs

# Check status
.\scripts\manage-docker.ps1 -Action status

# Open shell
.\scripts\manage-docker.ps1 -Action shell

# Clean up everything
.\scripts\manage-docker.ps1 -Action clean
```
