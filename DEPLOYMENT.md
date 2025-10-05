# 🚀 Deployment Guide

Complete guide for deploying Your Personal Accountant to production.

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security audit completed
- [ ] API keys secured
- [ ] CORS settings configured
- [ ] SSL certificates obtained
- [ ] Backup strategy in place
- [ ] Monitoring tools set up
- [ ] Performance testing completed

---

## 🏠 Local Development

### Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs on: `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## ☁️ Production Deployment

### Option 1: Traditional Server (VPS/Dedicated)

#### Backend Deployment

**1. Prepare the Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

**2. Setup Application**

```bash
# Clone repository
git clone https://github.com/your-username/Your_Personal_Accountant.git
cd Your_Personal_Accountant/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

**3. Configure Environment**

```bash
# Create production .env file
nano .env
```

```env
DB_PATH=/var/www/finance_app/finance.db
CORS_ALLOW_ORIGINS=https://yourdomain.com
JWT_SECRET=your-super-secure-secret-key-change-this
FLASK_ENV=production
FLASK_DEBUG=False
```

**4. Setup Gunicorn**

Create `/etc/systemd/system/finance-backend.service`:

```ini
[Unit]
Description=Finance Backend Gunicorn Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/Your_Personal_Accountant/backend
Environment="PATH=/var/www/Your_Personal_Accountant/backend/venv/bin"
ExecStart=/var/www/Your_Personal_Accountant/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind 0.0.0.0:5000 \
    --timeout 120 \
    --access-logfile /var/log/finance-backend/access.log \
    --error-logfile /var/log/finance-backend/error.log \
    app:app

[Install]
WantedBy=multi-user.target
```

**5. Start Backend Service**

```bash
# Create log directory
sudo mkdir -p /var/log/finance-backend
sudo chown www-data:www-data /var/log/finance-backend

# Enable and start service
sudo systemctl enable finance-backend
sudo systemctl start finance-backend
sudo systemctl status finance-backend
```

**6. Configure Nginx**

Create `/etc/nginx/sites-available/finance-app`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for AI processing
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/finance-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. Setup SSL**

```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

#### Frontend Deployment

**1. Build Production Bundle**

```bash
cd frontend

# Update API URL in .env
echo "REACT_APP_API_URL=https://api.yourdomain.com" > .env.production

# Build
npm run build
```

**2. Deploy to Server**

```bash
# Copy build to server
scp -r build/* user@yourserver:/var/www/finance-app/frontend/
```

**3. Configure Nginx**

Create `/etc/nginx/sites-available/finance-frontend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/finance-app/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Enable and setup SSL
sudo ln -s /etc/nginx/sites-available/finance-frontend /etc/nginx/sites-enabled/
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl restart nginx
```

---

### Option 2: Docker Deployment

**1. Create Dockerfile for Backend**

`backend/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]
```

**2. Create Dockerfile for Frontend**

`frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

`frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
    }
}
```

**3. Create docker-compose.yml**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: finance-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - DB_PATH=/app/data/finance.db
      - JWT_SECRET=${JWT_SECRET}
      - FLASK_ENV=production
      - FLASK_DEBUG=False
    volumes:
      - backend-data:/app/data
    networks:
      - finance-network

  frontend:
    build: ./frontend
    container_name: finance-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - finance-network
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

volumes:
  backend-data:

networks:
  finance-network:
    driver: bridge
```

**4. Deploy with Docker Compose**

```bash
# Create .env file
echo "JWT_SECRET=your-super-secure-secret" > .env

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 3: Cloud Platform Deployment

#### Heroku Deployment

**Backend:**

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-finance-backend

# Add PostgreSQL (recommended for production)
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FLASK_ENV=production

# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
git push heroku main
```

**Frontend:**

```bash
# Create frontend app
heroku create your-finance-frontend

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Configure environment
heroku config:set REACT_APP_API_URL=https://your-finance-backend.herokuapp.com

# Deploy
git subtree push --prefix frontend heroku main
```

---

#### AWS Deployment (EC2 + S3)

**Backend on EC2:**

1. Launch EC2 instance (Ubuntu 20.04)
2. Configure security groups (ports 80, 443, 22)
3. Follow VPS deployment steps above
4. Use Amazon RDS for database (recommended)

**Frontend on S3 + CloudFront:**

```bash
# Build
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS
aws configure

# Create S3 bucket
aws s3 mb s3://your-finance-app

# Enable static website hosting
aws s3 website s3://your-finance-app --index-document index.html

# Upload build
aws s3 sync build/ s3://your-finance-app --acl public-read

# Create CloudFront distribution for HTTPS
# Use AWS Console for CloudFront setup
```

---

#### DigitalOcean App Platform

**1. Create app.yaml**

```yaml
name: personal-accountant
services:
  - name: backend
    github:
      repo: your-username/Your_Personal_Accountant
      branch: main
      deploy_on_push: true
    source_dir: /backend
    environment_slug: python
    run_command: gunicorn app:app
    envs:
      - key: JWT_SECRET
        scope: RUN_TIME
        value: ${JWT_SECRET}
      - key: FLASK_ENV
        value: production
    http_port: 5000

  - name: frontend
    github:
      repo: your-username/Your_Personal_Accountant
      branch: main
      deploy_on_push: true
    source_dir: /frontend
    environment_slug: node-js
    build_command: npm run build
    run_command: npx serve -s build -l 3000
    envs:
      - key: REACT_APP_API_URL
        value: ${backend.PUBLIC_URL}
    http_port: 3000

databases:
  - name: finance-db
    engine: PG
    production: true
```

**2. Deploy**

```bash
# Install doctl
# Follow: https://docs.digitalocean.com/reference/doctl/

# Deploy
doctl apps create --spec app.yaml
```

---

## 🗄️ Database Migration

### From SQLite to PostgreSQL (Recommended for Production)

**1. Export SQLite data**

```bash
sqlite3 finance.db .dump > backup.sql
```

**2. Install PostgreSQL**

```bash
sudo apt install postgresql postgresql-contrib
```

**3. Create database**

```bash
sudo -u postgres psql
CREATE DATABASE finance_db;
CREATE USER finance_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE finance_db TO finance_user;
\q
```

**4. Update backend code**

Install PostgreSQL adapter:

```bash
pip install psycopg2-binary
```

Update database connection in `app.py`:

```python
import psycopg2
from psycopg2.extras import RealDictCursor

# Replace SQLite connection with PostgreSQL
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://finance_user:secure_password@localhost/finance_db')

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn
```

**5. Import data**

```bash
# Convert SQLite dump for PostgreSQL
sed -i 's/AUTOINCREMENT/SERIAL/g' backup.sql

# Import
psql -U finance_user -d finance_db -f backup.sql
```

---

## 🔒 Security Hardening

### SSL/TLS Configuration

**Strong SSL Configuration for Nginx:**

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Environment Variables

**Never commit these to Git:**

```bash
# Backend .env
JWT_SECRET=use-openssl-rand-base64-32-to-generate
DB_PASSWORD=secure-random-password
CEREBRAS_API_KEY=keep-this-secret
FLASK_SECRET_KEY=another-random-secret

# Frontend .env.production
REACT_APP_API_URL=https://api.yourdomain.com
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

---

## 📊 Monitoring & Logging

### Application Monitoring

**Install monitoring tools:**

```bash
pip install prometheus-flask-exporter
```

**Add to app.py:**

```python
from prometheus_flask_exporter import PrometheusMetrics

metrics = PrometheusMetrics(app)
```

### Log Management

**Centralized logging with systemd:**

```bash
# View backend logs
sudo journalctl -u finance-backend -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Checks

**Add health endpoint to backend:**

```python
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200
```

**Setup monitoring service:**

- Use UptimeRobot (free)
- Ping `/health` endpoint every 5 minutes
- Get alerts if service is down

---

## 🔄 Continuous Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/Your_Personal_Accountant
            git pull origin main
            cd backend
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart finance-backend
      
      - name: Build and Deploy Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          
      - name: Upload to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          SOURCE_DIR: 'frontend/build'
```

---

## 🔙 Backup Strategy

### Automated Database Backups

**Create backup script** (`/usr/local/bin/backup-finance-db.sh`):

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/finance-db"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/var/www/finance_app/finance.db"

mkdir -p $BACKUP_DIR

# Create backup
sqlite3 $DB_PATH ".backup '$BACKUP_DIR/finance_backup_$DATE.db'"

# Compress
gzip $BACKUP_DIR/finance_backup_$DATE.db

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: finance_backup_$DATE.db.gz"
```

**Schedule with cron:**

```bash
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-finance-db.sh
```

---

## 🚨 Troubleshooting Production Issues

### Common Issues

**503 Service Unavailable:**
```bash
# Check backend service
sudo systemctl status finance-backend
sudo journalctl -u finance-backend -n 50

# Restart if needed
sudo systemctl restart finance-backend
```

**Database locked:**
```bash
# Check for hanging connections
lsof | grep finance.db

# Kill process if needed
kill -9 <PID>
```

**High memory usage:**
```bash
# Monitor resources
htop

# Adjust gunicorn workers
# Edit: /etc/systemd/system/finance-backend.service
# Reduce --workers count
```

---

## 📈 Performance Optimization

### Backend Optimization

1. **Use connection pooling** for database
2. **Enable Gzip compression** in Nginx
3. **Implement caching** with Redis
4. **Optimize database queries** with indexes

### Frontend Optimization

1. **Enable CDN** for static assets
2. **Implement lazy loading** for routes
3. **Optimize images** and assets
4. **Use service workers** for caching

---

## ✅ Post-Deployment Checklist

- [ ] All services running
- [ ] SSL certificates valid
- [ ] Database backups working
- [ ] Monitoring active
- [ ] Health checks passing
- [ ] Logs rotating properly
- [ ] Performance acceptable
- [ ] Security headers present
- [ ] API endpoints responding
- [ ] Frontend loading correctly

---

**Need help?** Check [Troubleshooting Guide](TROUBLESHOOTING.md) or open an issue on GitHub.
