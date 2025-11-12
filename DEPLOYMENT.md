# Production Deployment Guide

## Pre-Deployment Checklist

### Security

- [ ] Change default `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Configure specific CORS origins (not `*`)
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Review and adjust rate limits based on expected traffic
- [ ] Ensure `NODE_ENV=production`
- [ ] Remove or restrict access to `/docs` and `/openapi.json` endpoints

### Database

- [ ] Set up production database (PostgreSQL or Turso)
- [ ] Run migrations: `npm run db:migrate`
- [ ] Set up database backups
- [ ] Configure `DATABASE_URL` and `DATABASE_AUTH_TOKEN` (if using Turso)
- [ ] Set up database connection pooling if needed

### Environment Variables

- [ ] All required variables set in `.env` or deployment platform
- [ ] `MNOTIFY_API_KEY` configured for SMS sending
- [ ] SMTP settings configured for email (if using email features)
- [ ] Validate all environment variables before deployment

### Monitoring & Logging

- [ ] Set appropriate `LOG_LEVEL` (info or warn for production)
- [ ] Set up application monitoring (e.g., PM2, DataDog, New Relic)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring for `/api/health` endpoint
- [ ] Configure log aggregation

### Performance

- [ ] Enable production optimizations
- [ ] Configure appropriate rate limits
- [ ] Set up CDN for static assets (if any)
- [ ] Review and optimize database queries

## Deployment Options

### Option 1: Traditional VPS/Server (Ubuntu)

1. **Set up the server:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL (if using local database)
sudo apt install postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Clone and set up the application:**

```bash
# Clone repository
git clone https://github.com/Africoda/smsx.git
cd smsx

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Set up environment variables
cp .env.example .env
nano .env  # Edit with production values
```

3. **Set up database:**

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE smsx;
CREATE USER smsx_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE smsx TO smsx_user;
\q

# Run migrations
npm run db:migrate
```

4. **Start with PM2:**

```bash
# Start application
pm2 start npm --name "smsx" -- start

# Set up auto-restart on reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs smsx
```

5. **Set up Nginx as reverse proxy:**

```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/smsx
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9999;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/smsx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

1. **Create Dockerfile:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 9999
USER node

CMD ["npm", "start"]
```

2. **Create docker-compose.yml:**

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "9999:9999"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/smsx
      - JWT_SECRET=${JWT_SECRET}
      - MNOTIFY_API_KEY=${MNOTIFY_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=smsx
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

3. **Deploy:**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Platforms

#### Railway

1. Install Railway CLI:

```bash
npm install -g @railway/cli
```

2. Deploy:

```bash
railway login
railway init
railway add postgresql
railway up
```

3. Set environment variables in Railway dashboard

#### Vercel

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

Note: You'll need to use a serverless-compatible database like Turso or PlanetScale.

#### Fly.io

1. Install Fly CLI:

```bash
curl -L https://fly.io/install.sh | sh
```

2. Create `fly.toml`:

```toml
app = "smsx"

[build]
builder = "heroku/buildpacks:20"

[env]
PORT = "8080"
NODE_ENV = "production"

[[services]]
internal_port = 8080
protocol = "tcp"

[[services.ports]]
handlers = [ "http" ]
port = 80

[[services.ports]]
handlers = [
  "tls",
  "http"
]
port = 443
```

3. Deploy:

```bash
fly launch
fly deploy
```

## Post-Deployment

### Health Checks

Monitor the health endpoint:

```bash
curl https://your-domain.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "database": "connected"
}
```

### Monitoring

Set up monitoring for:

- Application uptime
- Response times
- Error rates
- Database connection status
- Rate limit violations
- Resource usage (CPU, memory, disk)

### Logging

Review logs regularly:

```bash
# With PM2
pm2 logs smsx

# With Docker
docker-compose logs -f app

# System logs
tail -f /var/log/syslog
```

### Backups

Set up automated backups:

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="smsx"

pg_dump -U smsx_user -d $DB_NAME > $BACKUP_DIR/smsx_$DATE.sql
gzip $BACKUP_DIR/smsx_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "smsx_*.sql.gz" -mtime +7 -delete
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### Updates

To update the application:

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Build
npm run build

# Run migrations
npm run db:migrate

# Restart application
pm2 restart smsx  # or docker-compose restart
```

## Troubleshooting

### Application won't start

- Check environment variables
- Verify database connection
- Check logs for errors
- Ensure port is available

### High memory usage

- Check for memory leaks
- Review database connection pooling
- Monitor long-running requests

### Slow performance

- Enable database query logging
- Check database indexes
- Review rate limiting settings
- Monitor external API calls (MNotify)

### Database connection errors

- Verify DATABASE_URL
- Check database server status
- Verify network connectivity
- Check connection pool settings

## Security Best Practices

1. **Keep dependencies updated:**

```bash
npm audit
npm update
```

2. **Use environment-specific configs:**

- Different JWT secrets per environment
- Stricter rate limits in production
- Enable additional logging in staging

3. **Regular security audits:**

- Run `npm audit` regularly
- Review application logs
- Monitor failed authentication attempts
- Check for suspicious activity

4. **Access control:**

- Limit SSH access
- Use strong passwords/keys
- Enable 2FA where possible
- Restrict database access

## Support

For deployment issues:

1. Check application logs
2. Verify environment configuration
3. Test health endpoint
4. Review this guide
5. Open an issue on GitHub
