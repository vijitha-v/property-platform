# Deployment Guide

## Server Requirements
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- Docker + Docker Compose
- Domain name pointing to server IP

## 1. Initial Server Setup

### Connect to server
```bash
ssh root@your-server-ip
```

### Create non-root deploy user
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Install Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy
```

### Install Node.js + PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
sudo npm install -g pm2
```

### Install Nginx + Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

## 2. Firewall Configuration
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 3. Clone and Configure
```bash
git clone <your-repo-url>
cd property-platform
cp .env.example .env
nano .env  # fill in production values
```

## 4. Start Docker Containers
```bash
docker compose up -d
```

## 5. Build and Start with PM2
```bash
npm install
npm run build
pm2 start dist/app.js --name property-api
pm2 save
pm2 startup
```

## 6. Nginx Configuration

Create `/etc/nginx/sites-available/property-platform`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/property-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. SSL with Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com
```

## 8. Verify Deployment
```bash
# Check PM2
pm2 status

# Check Docker containers
docker ps

# Check Nginx
sudo systemctl status nginx

# Test health endpoint
curl https://yourdomain.com/health
```

## 9. Logging
```bash
# PM2 logs
pm2 logs property-api

# Application logs
tail -f logs/combined.log
tail -f logs/error.log
```

## 10. Useful Commands
```bash
# Restart app
pm2 restart property-api

# Reload Nginx
sudo systemctl reload nginx

# Renew SSL
sudo certbot renew

# Update deployment
git pull
npm run build
pm2 restart property-api
```