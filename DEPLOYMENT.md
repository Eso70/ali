# Production Deployment Guide

This guide covers deploying the Ali Network application to a VPS with optimal performance settings.

## Prerequisites

- Node.js 20+ installed
- PM2 installed globally: `npm install -g pm2`
- Nginx installed and configured
- SSL certificate via Let's Encrypt (Certbot)
- Domain DNS pointing to your VPS IP

## Quick Start

### 1. Install Dependencies

```bash
npm ci --production=false
```

### 2. Set Environment Variables

Create a `.env.production` file with:

```bash
# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alinetwork
DB_USER=postgres
DB_PASSWORD=your-database-password

# Application
PORT=3001
# Internal URL - Next.js runs on localhost:3001 internally
# Nginx reverse proxy handles domain routing (alinetwork.net -> localhost:3001)
# This is the standard reverse proxy pattern - the app doesn't need to know about the public domain
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=production

# CORS (optional)
CORS_ALLOWED_ORIGINS=https://alinetwork.net,http://localhost:3001
```

**Note:** This follows the standard reverse proxy pattern:
- Next.js runs on `localhost:3001` (internal)
- Nginx reverse proxy forwards `alinetwork.net` → `localhost:3001`
- The app doesn't need to know about the public domain - Nginx handles all domain routing

### 3. Build the Application

```bash
npm run build
```

### 4. Start with PM2

```bash
# Start with ecosystem config (recommended)
npm run pm2:start

# Or start manually with cluster mode
pm2 start npm --name "ali-network" -- start -i max

# Save PM2 process list
pm2 save

# Enable PM2 startup on system boot
pm2 startup
# Follow the instructions shown
```

### 5. Monitor the Application

```bash
# View logs
npm run pm2:logs

# Monitor resources
npm run pm2:monit

# Check status
pm2 status
```

## Nginx Configuration

Create `/etc/nginx/sites-available/ali-network`:

**Note:** Make sure to update the `proxy_pass` port (3001 by default) to match your `PORT` environment variable.

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name alinetwork.net www.alinetwork.net;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
# Note: Update proxy_pass port to match your PORT environment variable (default: 3001)
server {
    listen 443 ssl http2;
    server_name alinetwork.net www.alinetwork.net;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/alinetwork.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alinetwork.net/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Timeouts (important for preventing 502 errors)
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;

    # Request size limits
    client_max_body_size 10M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Buffer settings for better performance
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
    proxy_temp_file_write_size 8k;

    # Keep-alive connections
    proxy_http_version 1.1;
    proxy_set_header Connection "";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Main location
    # Note: Change 3001 to match your PORT environment variable
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts (matching server-level)
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Cache static assets
    location /_next/static/ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
        expires 1y;
    }

    # Cache images
    location /_next/image/ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Cache public assets
    location /images/ {
        proxy_pass http://localhost:3001;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800";
    }
}
```

Enable and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/ali-network /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Setup with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d alinetwork.net -d www.alinetwork.net
sudo certbot renew --dry-run  # Test auto-renewal
```

## PM2 Management

### Useful Commands

```bash
# Start application
npm run pm2:start

# Stop application
npm run pm2:stop

# Restart application
npm run pm2:restart

# Delete application
npm run pm2:delete

# View logs
npm run pm2:logs

# Monitor resources
npm run pm2:monit

# Save current process list
pm2 save

# List all processes
pm2 list

# Show detailed info
pm2 show ali-network
```

### Adjusting Instance Count

For a 12-core VPS, you can adjust instances:

```bash
# Use 8 instances (recommended - leaves 4 cores for system)
PM2_INSTANCES=8 pm2 start ecosystem.config.js

# Use all cores (max)
PM2_INSTANCES=max pm2 start ecosystem.config.js

# Or edit ecosystem.config.js directly
```

## System Optimization

### Increase File Descriptor Limits

```bash
# Edit limits
sudo nano /etc/security/limits.conf
# Add:
* soft nofile 65535
* hard nofile 65535

# For systemd
sudo nano /etc/systemd/system.conf
# Set:
DefaultLimitNOFILE=65535

sudo systemctl daemon-reload
```

### Enable PM2 Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Performance Monitoring

### Check System Resources

```bash
# CPU and memory
htop

# Memory only
free -h

# Disk usage
df -h
```

### Monitor Application

```bash
# PM2 monitoring dashboard
pm2 monit

# Real-time logs
pm2 logs ali-network --lines 100

# Error logs only
pm2 logs ali-network --err --lines 100
```

## Troubleshooting 502 Errors

If you encounter 502 Bad Gateway errors:

1. **Check PM2 status**: `pm2 status`
2. **Check logs**: `pm2 logs ali-network --err`
3. **Verify Nginx config**: `sudo nginx -t`
4. **Check if app is running**: `curl http://localhost:${PORT:-3001}` (or `curl http://localhost:3001`)
5. **Increase Nginx timeouts** (see configuration above)
6. **Reduce PM2 instances** if memory is an issue
7. **Check system resources**: `htop`, `free -h`

## Updating the Application

```bash
# Pull latest changes
git pull

# Install new dependencies (if any)
npm ci

# Rebuild
npm run build

# Restart PM2
npm run pm2:restart

# Or zero-downtime reload
pm2 reload ali-network
```

## Backup Recommendations

1. **Database**: Backup PostgreSQL database regularly using `pg_dump`
2. **Environment variables**: Keep `.env.production` backed up securely
3. **Application files**: Use version control (Git)
4. **PM2 process list**: `pm2 save` saves current configuration

## Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication enabled
- [ ] Environment variables secured (not in Git)
- [ ] PM2 running as non-root user (recommended)
- [ ] Regular system updates: `sudo apt update && sudo apt upgrade`

## Recommended VPS Specs

- **CPU**: 4+ cores (12 cores ideal for high traffic)
- **RAM**: 4GB+ (2GB minimum)
- **Storage**: 20GB+ SSD
- **Bandwidth**: Sufficient for your traffic needs
