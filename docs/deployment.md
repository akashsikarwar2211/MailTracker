# 🚀 Deployment Guide

This guide covers deploying the InspMail email analysis system to production environments.

## 📋 Prerequisites

- GitHub repository with the complete codebase
- MongoDB Atlas account (or self-hosted MongoDB)
- Vercel account (for frontend)
- Render/Heroku/AWS account (for backend)
- Domain name (optional)

## 🎯 Frontend Deployment (Vercel)

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory

### 2. Configure Environment Variables

Set the following environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=InspMail
```

### 3. Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy

1. Click "Deploy"
2. Vercel will automatically build and deploy your frontend
3. Your app will be available at `https://your-project.vercel.app`

## 🔧 Backend Deployment

### Option 1: Render (Recommended)

#### 1. Connect to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository

#### 2. Configure Service

- **Name**: `inspmail-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

#### 3. Environment Variables

Set these environment variables in Render:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inspmail
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 4. Deploy

1. Click "Create Web Service"
2. Render will build and deploy your backend
3. Your API will be available at `https://your-service.onrender.com`

### Option 2: Heroku

#### 1. Connect to Heroku

1. Install Heroku CLI
2. Run `heroku login`
3. Create new app: `heroku create your-app-name`

#### 2. Configure Environment

```bash
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set IMAP_HOST="imap.gmail.com"
heroku config:set IMAP_PORT="993"
heroku config:set IMAP_USER="your-email@gmail.com"
heroku config:set IMAP_PASSWORD="your-app-password"
heroku config:set IMAP_TLS="true"
heroku config:set NODE_ENV="production"
```

#### 3. Deploy

```bash
git push heroku main
```

### Option 3: AWS EC2

#### 1. Launch EC2 Instance

1. Launch Ubuntu 20.04 LTS instance
2. Configure security groups (open ports 22, 80, 443, 3001)
3. Connect via SSH

#### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 3. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/inspmail.git
cd inspmail/backend

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start dist/main.js --name "inspmail-backend"
pm2 startup
pm2 save
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/inspmail`:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/inspmail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster (free tier available)
3. Choose cloud provider and region

### 2. Configure Network Access

1. Go to "Network Access"
2. Add IP address `0.0.0.0/0` (or specific IPs)
3. Click "Confirm"

### 3. Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username/password
4. Set privileges to "Read and write to any database"

### 4. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password

## 🔐 Environment Variables Reference

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inspmail

# IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app

# Email Processing
EMAIL_SUBJECT_FILTER=Test Email Analysis
PROCESSING_INTERVAL=30000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=InspMail
```

## 🚦 Health Checks

### Backend Health Check

Create a health check endpoint in your backend:

```typescript
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'connected', // Add actual DB check
    imap: 'connected', // Add actual IMAP check
  }
}
```

### Frontend Health Check

Vercel automatically provides health checks. For custom domains, you can add:

```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
```

## 📊 Monitoring & Logs

### Backend Monitoring

- **Render**: Built-in monitoring dashboard
- **Heroku**: Use Heroku add-ons for monitoring
- **AWS**: CloudWatch for metrics and logs

### Frontend Monitoring

- **Vercel**: Built-in analytics and performance monitoring
- **Custom**: Integrate with services like Sentry for error tracking

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Add your deployment commands here
          echo "Deploying backend..."

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Add your deployment commands here
          echo "Deploying frontend..."
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly in backend
2. **Database Connection**: Check MongoDB Atlas network access and credentials
3. **IMAP Connection**: Verify IMAP credentials and server settings
4. **Build Failures**: Check Node.js version compatibility

### Debug Commands

```bash
# Check backend logs
pm2 logs inspmail-backend

# Check nginx status
sudo systemctl status nginx

# Test database connection
mongo "your-connection-string" --eval "db.runCommand('ping')"

# Test IMAP connection
telnet imap.gmail.com 993
```

## 📈 Performance Optimization

### Backend

- Enable compression middleware
- Implement caching for frequently accessed data
- Use connection pooling for MongoDB
- Optimize IMAP polling intervals

### Frontend

- Enable Next.js image optimization
- Implement proper caching strategies
- Use React.memo for expensive components
- Optimize bundle size with dynamic imports

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict CORS to your frontend domain only
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs
6. **Authentication**: Consider adding user authentication for admin features

## 📞 Support

For deployment issues:

1. Check the logs in your hosting platform
2. Verify environment variables are set correctly
3. Test database and IMAP connections locally
4. Check network security group settings
5. Review the troubleshooting section above
