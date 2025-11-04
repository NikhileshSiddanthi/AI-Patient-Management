# Backend Deployment Guide - Patient Management System

## Overview
This guide provides complete instructions for deploying the Patient Management System backend API to various cloud platforms.

## Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL 14+ database
- Redis 6+ instance
- SSL certificates for production
- Cloud account (AWS, Railway, Render, or DigitalOcean)

## Environment Configuration

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Server
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database
DB_SSL=true

# Redis
REDIS_URL=redis://user:password@host:port

# JWT Secrets (Generate strong secrets)
JWT_SECRET=<your-256-bit-secret>
JWT_REFRESH_SECRET=<your-256-bit-secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# AI Features (Optional)
AI_SERVICE_ENABLED=true
AI_API_KEY=<your-ai-provider-key>
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pms_db;

# Create user (recommended for security)
CREATE USER pms_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pms_db TO pms_user;
```

### 2. Run Migrations

```bash
# Navigate to backend directory
cd backend

# Run schema migration
psql -U pms_user -d pms_db -f database/schema.sql
```

## Deployment Options

## Option 1: Railway (Recommended - Easiest)

Railway provides PostgreSQL and Redis out of the box.

### Steps:

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize Project**
```bash
cd backend
railway init
```

3. **Add PostgreSQL and Redis**
```bash
railway add postgresql
railway add redis
```

4. **Set Environment Variables**
```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret_here
# Add all other environment variables
```

5. **Deploy**
```bash
railway up
```

6. **Run Database Migration**
```bash
# Get database URL
railway variables get DATABASE_URL

# Run migration locally targeting Railway DB
psql <DATABASE_URL> -f database/schema.sql
```

### Railway Configuration File

Create `railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "pms-backend"
```

---

## Option 2: AWS (EC2 + RDS)

### Architecture:
- EC2 instance for Node.js application
- RDS PostgreSQL for database
- ElastiCache Redis for caching

### Steps:

1. **Create RDS PostgreSQL Instance**
- Navigate to AWS RDS Console
- Create database (PostgreSQL 14+)
- Configure security groups
- Note connection endpoint

2. **Create ElastiCache Redis**
- Navigate to ElastiCache Console
- Create Redis cluster
- Note connection endpoint

3. **Launch EC2 Instance**
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone your-repo-url
cd patient-management-system/backend

# Install dependencies
npm install

# Set environment variables
sudo nano /etc/environment
# Add all environment variables

# Build TypeScript
npm run build

# Run migrations
psql $DATABASE_URL -f database/schema.sql

# Start with PM2
pm2 start dist/server.js --name pms-api
pm2 save
pm2 startup
```

4. **Configure Nginx (Optional)**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 3: Render

### Steps:

1. **Create Blueprint**

Create `render.yaml`:

```yaml
services:
  - type: web
    name: pms-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: pms-db
          property: connectionString
      - key: REDIS_URL
        fromDatabase:
          name: pms-redis
          property: connectionString

databases:
  - name: pms-db
    databaseName: pms_db
    plan: starter

  - name: pms-redis
    plan: starter
```

2. **Deploy**
- Connect GitHub repository to Render
- Render will automatically deploy
- Run migrations via Render shell

---

## Option 4: DigitalOcean App Platform

### Steps:

1. **Create App Spec**

Create `.do/app.yaml`:

```yaml
name: pms-backend
services:
  - name: api
    github:
      repo: your-org/your-repo
      branch: main
      deploy_on_push: true
    build_command: npm install && npm run build
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
    instance_size_slug: basic-xxs
    instance_count: 1

databases:
  - name: pms-db
    engine: PG
    version: "14"
    size: db-s-1vcpu-1gb

  - name: pms-redis
    engine: REDIS
    version: "7"
    size: db-s-1vcpu-1gb
```

2. **Deploy via CLI**
```bash
doctl apps create --spec .do/app.yaml
```

---

## Post-Deployment Checklist

### 1. Health Check
```bash
curl https://your-api-domain.com/health
```

### 2. Test Authentication
```bash
curl -X POST https://your-api-domain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "patient",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Verify Database Connection
```bash
# Check logs for database connection success
```

### 4. Enable HTTPS
- Use Let's Encrypt for SSL certificates
- Most platforms provide automatic HTTPS

### 5. Configure CORS
- Update `CORS_ORIGIN` environment variable with your Vercel frontend URL
- Example: `https://your-app.vercel.app`

### 6. Set Up Monitoring
- Configure error logging (Sentry, LogRocket)
- Set up uptime monitoring
- Configure database backups

---

## Scaling Considerations

### Horizontal Scaling
```bash
# Railway
railway scale --replicas 3

# AWS
# Use Auto Scaling Groups with Load Balancer

# Render
# Adjust instance count in dashboard
```

### Database Optimization
- Enable connection pooling
- Configure read replicas for read-heavy operations
- Implement caching strategy with Redis

### Performance Tips
1. Enable compression (already configured)
2. Implement CDN for static assets
3. Use database indexes (already in schema)
4. Monitor slow queries
5. Implement request rate limiting (already configured)

---

## Security Best Practices

1. **Never commit `.env` file**
2. **Use strong JWT secrets** (min 256-bit)
3. **Enable HTTPS** in production
4. **Implement rate limiting** (configured)
5. **Regular security updates**
6. **Database backups** (automated recommended)
7. **Audit logs** (implemented in schema)
8. **HIPAA compliance** (follow regulatory guidelines)

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check SSL requirements
# Most cloud providers require SSL
```

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
```

### Build Failures
```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Frontend Integration

After deploying backend, update your Vercel frontend environment variables:

```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

---

## Support

For issues or questions:
1. Check application logs
2. Verify environment variables
3. Ensure database migrations ran successfully
4. Check security group / firewall settings
5. Review CORS configuration

## Cost Estimates

| Platform | Starter Cost | Production Cost |
|----------|-------------|-----------------|
| Railway | $5/month | $20-50/month |
| Render | Free tier available | $25-75/month |
| AWS EC2 | $10/month (t2.micro) | $50-200/month |
| DigitalOcean | $5/month (Basic) | $40-100/month |

*Costs include database and Redis instances*
