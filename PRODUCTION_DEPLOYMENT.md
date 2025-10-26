# 🚀 Production Deployment Guide for osdg.in

This guide covers deploying the OSDG Web application to production on **osdg.in** using Docker.

## Quick Production Deployment

```bash
# On your server (osdg.in)
git clone <repo-url> /var/www/osdg-web
cd /var/www/osdg-web
./scripts/init-data.sh
docker-compose -f docker-compose.prod.yml up -d
```

---

## Prerequisites

### Server Requirements
- Ubuntu/Debian Linux server with root access
- Domain: osdg.in (DNS configured)
- Minimum: 2GB RAM, 2 CPU cores, 20GB storage
- Ports 80 and 443 open

### Software Requirements
- Docker & Docker Compose
- Nginx (for reverse proxy and SSL)
- Git
- Certbot (for Let's Encrypt SSL)

---

## Step-by-Step Production Setup

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y git curl wget nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose (if not included)
sudo apt install -y docker-compose

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Clone Repository

```bash
# Create deployment directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/P-V-Abhinav/NewEra_OSDG.git osdg-web
sudo chown -R $USER:$USER osdg-web
cd osdg-web
```

### 3. Initialize Data Directory

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Initialize data directory
./scripts/init-data.sh

# Set proper permissions
sudo chmod 777 data
sudo chmod 666 data/projects.json
```

### 4. Configure CAS Authentication

The application is pre-configured to use `login-test2.iiit.ac.in` which is whitelisted for osdg.in.

**Current Configuration (in docker-compose.prod.yml):**
```yaml
environment:
  - CAS_BASE_URL=https://login-test2.iiit.ac.in/cas
```

**✅ This works for osdg.in in production!**

> **Note:** The login-test2 server is whitelisted for osdg.in, so authentication will work seamlessly in production.

### 5. Deploy Docker Container

```bash
# Build and start the container
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Verify container is running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

The application is now running on port **8080** internally.

### 6. Configure Nginx Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/osdg.in
```

Add the following configuration:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name osdg.in www.osdg.in;
    
    # Let's Encrypt certificate validation
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main Application
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name osdg.in www.osdg.in;
    
    # SSL Configuration (Let's Encrypt will update these)
    ssl_certificate /etc/letsencrypt/live/osdg.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/osdg.in/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/osdg.in/chain.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /var/log/nginx/osdg.in.access.log;
    error_log /var/log/nginx/osdg.in.error.log;
    
    # Proxy to Docker Container
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Forward original request info
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/osdg.in /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 7. Setup SSL with Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d osdg.in -d www.osdg.in

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (recommended)

# Verify auto-renewal
sudo certbot renew --dry-run

# Certificate auto-renews every 90 days
```

### 8. Verify Deployment

```bash
# Check Docker container
docker ps | grep osdg-web

# Check logs
docker-compose -f docker-compose.prod.yml logs --tail=50

# Check Nginx
sudo systemctl status nginx

# Test website
curl -I https://osdg.in

# Test CAS authentication
# Visit: https://osdg.in
# Click "Login" - should redirect to login-test2.iiit.ac.in
```

---

## Production Configuration Summary

### CAS Authentication
- **Server:** `https://login-test2.iiit.ac.in/cas`
- **Status:** ✅ Whitelisted for osdg.in
- **Callback:** `https://osdg.in/api/auth/cas/callback`
- **Auto-detects domain:** Works on osdg.in, www.osdg.in, etc.

### Docker Container
- **Port:** 8080 (internal, proxied by Nginx)
- **Data:** `/var/www/osdg-web/data` (persistent)
- **Restart:** Automatic (unless-stopped)
- **Health Check:** Every 30s

### Nginx
- **HTTP:** Port 80 (redirects to HTTPS)
- **HTTPS:** Port 443 (SSL enabled)
- **Proxy:** localhost:8080 → Docker container

---

## Maintenance

### Update Application

```bash
cd /var/www/osdg-web

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Verify
docker-compose -f docker-compose.prod.yml logs -f
```

### Backup Data

```bash
# Create timestamped backup
cd /var/www/osdg-web
tar -czf ~/backup-osdg-$(date +%Y%m%d-%H%M%S).tar.gz data/

# Or just backup projects.json
cp data/projects.json ~/projects-backup-$(date +%Y%m%d).json
```

### Monitor Logs

```bash
# Docker logs
docker-compose -f docker-compose.prod.yml logs -f

# Nginx access logs
sudo tail -f /var/log/nginx/osdg.in.access.log

# Nginx error logs
sudo tail -f /var/log/nginx/osdg.in.error.log

# System logs
journalctl -u docker -f
```

### Restart Services

```bash
# Restart Docker container
docker-compose -f docker-compose.prod.yml restart

# Restart Nginx
sudo systemctl restart nginx

# Restart both
docker-compose -f docker-compose.prod.yml restart && sudo systemctl restart nginx
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml down
docker system prune -a
docker-compose -f docker-compose.prod.yml up -d --build
```

### CAS Authentication Fails

```bash
# Check CAS URL configuration
docker-compose -f docker-compose.prod.yml exec website env | grep CAS

# Should show: CAS_BASE_URL=https://login-test2.iiit.ac.in/cas

# Check Docker logs for CAS errors
docker-compose -f docker-compose.prod.yml logs | grep CAS

# Test CAS server connectivity
curl -I https://login-test2.iiit.ac.in/cas
```

### Projects Not Persisting

```bash
# Check data directory
ls -la /var/www/osdg-web/data/

# Check volume mount
docker inspect osdg-web-prod | grep -A 10 Mounts

# Verify permissions
sudo chmod 777 /var/www/osdg-web/data
sudo chmod 666 /var/www/osdg-web/data/projects.json

# Restart container
docker-compose -f docker-compose.prod.yml restart
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Test Nginx config
sudo nginx -t

# Check certificate expiry
echo | openssl s_client -servername osdg.in -connect osdg.in:443 2>/dev/null | openssl x509 -noout -dates
```

### High Resource Usage

```bash
# Check resource usage
docker stats osdg-web-prod

# Check system resources
htop

# Restart container (frees memory)
docker-compose -f docker-compose.prod.yml restart
```

---

## Security Checklist

- [x] SSL/HTTPS enabled
- [x] Auto-redirect HTTP to HTTPS
- [x] Security headers configured
- [x] Non-root Docker user
- [x] Firewall configured (only 80, 443, 22 open)
- [x] CAS authentication required
- [x] Data directory properly secured
- [x] Regular backups scheduled
- [x] Auto-restart enabled
- [x] Log monitoring setup

---

## Performance Optimization

### Enable Nginx Caching

Add to Nginx config:

```nginx
# Cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

location / {
    proxy_cache my_cache;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    proxy_cache_valid 200 1h;
    # ... rest of proxy settings
}
```

### Enable Gzip Compression

Add to Nginx config:

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/x-font-ttf font/opentype image/svg+xml;
```

---

## Monitoring Setup (Optional)

### Install Uptime Monitor

```bash
# Install uptimekuma
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```

Access at: `http://your-server-ip:3001`

### Setup Log Rotation

Create `/etc/logrotate.d/osdg-web`:

```
/var/log/nginx/osdg.in.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

---

## Production URLs

- **Website:** https://osdg.in
- **CAS Login:** https://login-test2.iiit.ac.in/cas/login
- **CAS Callback:** https://osdg.in/api/auth/cas/callback

---

## Support

For issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verify services: `sudo systemctl status nginx docker`
3. Test connectivity: `curl -I https://osdg.in`
4. Check disk space: `df -h`

---

**Deployment Status:** Ready for production on osdg.in ✅

**CAS Authentication:** Configured for login-test2.iiit.ac.in (whitelisted) ✅

**Data Persistence:** Enabled with Docker volumes ✅
