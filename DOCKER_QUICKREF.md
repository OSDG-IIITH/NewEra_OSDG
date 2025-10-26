# 🐳 OSDG Web - Docker Quick Reference

## Quick Start

```bash
# One-line deployment (Linux/Mac)
./scripts/deploy-docker.sh

# One-line deployment (Windows)
.\scripts\deploy-docker.ps1

# Manual deployment
./scripts/init-data.sh && docker-compose up -d
```

## Essential Commands

### Start & Stop
```bash
docker-compose up -d              # Start in background
docker-compose up                 # Start with logs
docker-compose down               # Stop and remove
docker-compose restart            # Restart container
```

### Monitoring
```bash
docker-compose logs -f            # Live logs
docker-compose logs --tail=50     # Last 50 lines
docker-compose ps                 # Container status
docker stats osdg-web             # Resource usage
```

### Building
```bash
docker-compose build              # Build image
docker-compose up -d --build      # Rebuild and restart
docker-compose build --no-cache   # Clean build
```

### Maintenance
```bash
docker-compose exec website sh    # Shell into container
docker-compose restart            # Restart without stopping
docker system prune -a            # Clean up Docker
```

## Data Management

### Backup
```bash
# Quick backup
cp data/projects.json data/projects.backup.json

# Timestamped backup
cp data/projects.json data/projects-$(date +%Y%m%d).json

# Full backup (tar)
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

### Restore
```bash
# Restore from backup
cp data/projects.backup.json data/projects.json
docker-compose restart

# Restore from tar
tar -xzf backup-20240101.tar.gz
docker-compose restart
```

### Reset
```bash
# Reset all projects
echo "[]" > data/projects.json
docker-compose restart
```

## Troubleshooting

### Permission Issues
```bash
# Linux/Mac
chmod 777 data
chmod 666 data/projects.json

# Windows
# Right-click data folder → Properties → Security → Edit
```

### Port Already in Use
Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change 3000 to 8080
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Full reset
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Data Not Persisting
```bash
# Verify volume mount
docker inspect osdg-web | grep -A 5 Mounts

# Should show: ./data → /app/data
```

## Network Info

- **Application URL:** http://localhost:3000
- **Container IP:** 172.21.1.2
- **Network:** website_network (172.21.1.0/24)
- **Internal Port:** 80
- **External Port:** 3000

## File Locations

```
osdg-web/
├── data/
│   └── projects.json          # User projects (persists)
├── Dockerfile                 # Image definition
├── docker-compose.yml         # Service config
├── .dockerignore             # Build optimization
└── scripts/
    ├── init-data.sh          # Initialize data dir
    ├── init-data.ps1         # Initialize (Windows)
    ├── deploy-docker.sh      # Deploy helper
    └── deploy-docker.ps1     # Deploy (Windows)
```

## Environment Variables

Set in `docker-compose.yml`:
```yaml
environment:
  - NODE_ENV=production
```

## URLs & Ports

| Service | Port | URL |
|---------|------|-----|
| Web App | 3000 | http://localhost:3000 |
| Container Internal | 80 | N/A |

## Common Workflows

### Update Application
```bash
git pull origin main
docker-compose up -d --build
```

### Check Everything is Working
```bash
docker-compose ps              # Should show "Up"
curl http://localhost:3000     # Should return HTML
cat data/projects.json         # Should show JSON array
```

### Debug Issues
```bash
docker-compose logs -f         # Watch logs
docker-compose exec website sh # Enter container
cd /app/data && ls -la         # Check data dir
cat /app/data/projects.json    # View projects
```

## Performance Tips

- Use `docker-compose up -d` for background operation
- Monitor with `docker stats` to check resource usage
- Clean up regularly: `docker system prune`
- Keep data directory small (backup old projects)

## Security Notes

- Container runs as non-root user (`nextjs`, uid 1001)
- Data directory isolated in volume
- Custom network prevents external access
- Restart policy: `unless-stopped`

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify data: `ls -la data/`
3. Test locally: `pnpm dev`
4. Read full docs: `DOCKER_DEPLOYMENT.md`

---

**Need more help?** See `DOCKER_DEPLOYMENT.md` for detailed documentation.
