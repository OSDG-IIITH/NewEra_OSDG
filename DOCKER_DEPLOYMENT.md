# Docker Deployment Guide for OSDG Web

This guide explains how to deploy the OSDG Web application using Docker with persistent storage for user-created projects.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)
- Git (to clone the repository)

## Quick Start

### 1. Initialize Data Directory

Before running the application, initialize the data directory:

**On Windows (PowerShell):**
```powershell
.\scripts\init-data.ps1
```

**On Linux/Mac:**
```bash
chmod +x scripts/init-data.sh
./scripts/init-data.sh
```

### 2. Run with Docker Compose

```bash
# Build and start the container in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Architecture

### Directory Structure

```
osdg-web/
├── data/                    # Persistent storage (mounted as volume)
│   └── projects.json       # User-created projects
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Service orchestration
└── .dockerignore          # Build optimization
```

### Docker Image

The Dockerfile uses a multi-stage build:

1. **Dependencies Stage**: Installs all dependencies
2. **Builder Stage**: Builds the Next.js application in standalone mode
3. **Runner Stage**: Minimal production image with only necessary files

**Key Features:**
- Based on Node 20 Alpine (minimal size)
- Runs as non-root user (`nextjs:nodejs`, uid 1001)
- Standalone output for optimal production performance
- Data directory with proper permissions for persistence

### Volume Mounting

The `docker-compose.yml` mounts the local `./data` directory to `/app/data` inside the container:

```yaml
volumes:
  - ./data:/app/data
```

This ensures:
- Projects persist across container restarts
- Easy backup (just copy the `data` folder)
- Direct access to data from host machine

## Common Commands

### Build and Run

```bash
# Build image
docker-compose build

# Start container in background
docker-compose up -d

# Start container with logs
docker-compose up

# Rebuild and restart
docker-compose up -d --build
```

### Monitoring

```bash
# View logs (all)
docker-compose logs -f

# View logs (last 100 lines)
docker-compose logs --tail=100 -f

# Check container status
docker-compose ps

# View resource usage
docker stats osdg-web
```

### Maintenance

```bash
# Stop container
docker-compose down

# Stop and remove volumes (⚠️ deletes data!)
docker-compose down -v

# Restart container
docker-compose restart

# Execute command in running container
docker-compose exec website sh
```

### Data Management

```bash
# Backup projects
cp data/projects.json data/projects.backup.json

# View projects
cat data/projects.json

# Reset projects (⚠️ deletes all projects!)
echo "[]" > data/projects.json
```

## Using Docker CLI Directly

If you prefer not to use Docker Compose:

```bash
# Build image
docker build -t osdg-web .

# Run container
docker run -d \
  --name osdg-web \
  -p 3000:80 \
  -v $(pwd)/data:/app/data \
  -e NODE_ENV=production \
  --restart unless-stopped \
  osdg-web

# Windows PowerShell:
docker run -d `
  --name osdg-web `
  -p 3000:80 `
  -v ${PWD}/data:/app/data `
  -e NODE_ENV=production `
  --restart unless-stopped `
  osdg-web

# View logs
docker logs -f osdg-web

# Stop container
docker stop osdg-web

# Remove container
docker rm osdg-web
```

## Network Configuration

The `docker-compose.yml` configures a custom network:

```yaml
networks:
  website_network:
    ipam:
      config:
        - subnet: 172.21.1.0/24
```

The container is assigned a static IP: `172.21.1.2`

## Troubleshooting

### Permission Issues

If you encounter permission errors with the data directory:

**On Linux/Mac:**
```bash
sudo chmod 777 data
sudo chmod 666 data/projects.json
```

**On Windows:**
Right-click `data` folder → Properties → Security → Edit → Add write permissions

### Port Already in Use

If port 3000 is already in use, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change 3000 to any available port
```

### Container Won't Start

Check logs for errors:
```bash
docker-compose logs
```

Common issues:
- Port conflict (change port in docker-compose.yml)
- Data directory permissions (run init script)
- Insufficient disk space (clean up: `docker system prune`)

### Data Not Persisting

Verify volume mount:
```bash
docker inspect osdg-web | grep -A 10 Mounts
```

Ensure `./data` is mounted to `/app/data`.

### Build Failures

Clear Docker cache and rebuild:
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## Environment Variables

Available environment variables (set in `docker-compose.yml`):

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment mode |
| `PORT` | `80` | Internal container port |

To add custom variables, edit `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - CUSTOM_VAR=value
```

## Production Deployment

For production deployment on a server:

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd osdg-web
   ```

2. **Initialize Data:**
   ```bash
   ./scripts/init-data.sh
   ```

3. **Configure Environment:**
   Edit `docker-compose.yml` to set production URLs and settings

4. **Deploy:**
   ```bash
   docker-compose up -d
   ```

5. **Set Up Reverse Proxy:**
   Use Nginx or Caddy to handle HTTPS and domain routing

6. **Enable Auto-Restart:**
   Already configured with `restart: unless-stopped`

## Updating the Application

To update to the latest version:

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Verify
docker-compose logs -f
```

Your data in the `./data` directory will be preserved.

## Security Considerations

1. **Non-Root User**: Container runs as user `nextjs` (uid 1001)
2. **Minimal Image**: Alpine Linux base reduces attack surface
3. **Data Isolation**: Volume mount isolates data from container
4. **Network Isolation**: Custom network prevents unwanted connections

## Performance Optimization

The Docker setup includes several optimizations:

- **Standalone Output**: Minimal Next.js runtime (~30MB vs ~200MB)
- **.dockerignore**: Excludes unnecessary files from build context
- **Multi-Stage Build**: Separates build and runtime environments
- **Alpine Base**: Smallest possible image size

## Backup and Restore

### Backup

```bash
# Create timestamped backup
tar -czf osdg-backup-$(date +%Y%m%d-%H%M%S).tar.gz data/

# Or just copy the JSON file
cp data/projects.json backups/projects-$(date +%Y%m%d).json
```

### Restore

```bash
# From tar backup
tar -xzf osdg-backup-20240101-120000.tar.gz

# From JSON file
cp backups/projects-20240101.json data/projects.json

# Restart container to apply
docker-compose restart
```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Verify data directory: `ls -la data/`
- Test without Docker: `pnpm dev`

## License

[Add your license information here]
