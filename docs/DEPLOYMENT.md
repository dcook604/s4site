# Strata Council Website Deployment Guide

> **Troubleshooting Note (2024-06):**
> All import paths must be relative (e.g., `../lib/prisma`). Do NOT use TypeScript path aliases (e.g., `@/lib/prisma`), as these are not resolved in Docker/CapRover builds and will cause build failures.

This guide provides comprehensive instructions for deploying the Strata Council Community Hub website to a CapRover server.

## Server Requirements

- **Server OS**: Ubuntu 20.04 LTS or newer (recommended)
- **CPU**: 1+ cores (2+ recommended for production)
- **RAM**: Minimum 1GB (2GB+ recommended for production)
- **Storage**: Minimum 10GB (20GB+ recommended for production)
- **Network**: Public IP address with ports 80, 443, and 3000 open
- **Software**: Docker, Docker Compose, and CapRover installed
- **Domain**: Valid domain name with DNS records pointing to your server

## Prerequisites

- A CapRover server already set up on your VPS ([CapRover Setup Guide](https://caprover.com/docs/get-started.html))
- Node.js 16+ and npm installed on your local machine
- CapRover CLI installed (`npm install -g caprover`)
- Git installed (for source code management)

## Pre-deployment Setup

### Environment Variables

Before deploying, make sure to set up the following environment variables in the CapRover dashboard:

1. Navigate to your app in CapRover dashboard
2. Go to "App Configs" tab
3. Under "Environmental Variables", add:

```
DATABASE_URL=file:/app/prisma/dev.db
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-generated-secret-key
```

To generate a secure NEXTAUTH_SECRET, use:

```bash
openssl rand -base64 32
```

### Setting Up SSL

CapRover automatically handles SSL certificates via Let's Encrypt, but you need to:

1. Ensure your domain's DNS A record points to your server's IP
2. Enable HTTPS in the CapRover dashboard for your app
3. Use a valid email for Let's Encrypt notifications

## Deployment Steps

### 1. Prepare Your Application

1. Clone the repository
2. Install dependencies:
   ```bash
   cd projects/website
   npm install
   ```
3. Build the application:
   ```bash
   npm run build
   ```
4. Verify the build works locally:
   ```bash
   npm run start
   ```

### 2. Deploy to CapRover

#### Option 1: Using the Deployment Script

1. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

3. Follow the prompts from the CapRover CLI

#### Option 2: Manual Deployment

1. Log in to your CapRover server:
   ```bash
   caprover login
   ```

2. Deploy the application:
   ```bash
   caprover deploy
   ```

3. Follow the prompts to select your captain server, enter your password, and choose the application name.

### 3. Database Migration

After the first deployment, you need to run the database migrations:

1. Connect to your server via SSH
2. Run the migration command in the app container:
   ```bash
   docker exec -it $(docker ps -q -f name=srv-captain--your-app-name) npx prisma migrate deploy
   ```

Replace `your-app-name` with the actual name you gave your application in CapRover.

### 4. Create Admin User

The first time you run the application, you'll need to create an admin account:

1. Navigate to your application URL with `/auth/signup` appended
2. Create your account with your email and password
3. The first user will automatically be assigned the admin role
4. After creating the first admin user, the signup page will be disabled

## Multi-environment Deployment

For organizations that require separate development, staging, and production environments:

### Development Environment

1. Create a separate app in CapRover called "strata-website-dev"
2. Set up environment variables with development settings
3. Deploy using:
   ```bash
   caprover deploy -a strata-website-dev
   ```

### Staging Environment

1. Create a separate app in CapRover called "strata-website-staging"
2. Set up environment variables with staging settings
3. Deploy using:
   ```bash
   caprover deploy -a strata-website-staging
   ```

### Production Environment

1. Create a separate app in CapRover called "strata-website"
2. Set up environment variables with production settings
3. Deploy using:
   ```bash
   caprover deploy -a strata-website
   ```

## Monitoring and Maintenance

### Health Checks

CapRover provides basic health monitoring. For additional monitoring:

1. Set up UptimeRobot or similar service to ping your application
2. Configure email alerts for downtime

### Logs

To view application logs:

1. In the CapRover dashboard, navigate to your app
2. Click on "Logs" tab
3. Alternatively, via command line:
   ```bash
   caprover logs -a your-app-name
   ```

### Updates and Maintenance

To update the application:

1. Pull the latest changes from the repository
2. Run the deployment script again
3. Verify the application works as expected

## Continuous Deployment

For continuous deployment, you can use GitHub Actions with the following steps:

1. Generate an app token from your CapRover dashboard:
   - Go to your app in CapRover
   - Navigate to the "Deployment" tab
   - Find the "App Token" section and generate a new token

2. Add the following secrets to your GitHub repository:
   - `CAPROVER_SERVER`: Your CapRover server URL (e.g., https://captain.yourdomain.com)
   - `CAPROVER_APP_NAME`: Your app name (e.g., strata-website)
   - `CAPROVER_APP_TOKEN`: The token you generated

3. Create a GitHub Actions workflow that uses the CapRover deploy action:

```yaml
name: Deploy to CapRover

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build the app
        run: npm run build
        
      - name: Create deployment tarball
        run: tar -cvf ./deploy.tar --exclude='*.map' ./captain-definition ./.next ./public ./package.json ./prisma
        
      - name: Deploy to CapRover
        uses: caprover/deploy-from-github@v1.1.2
        with:
          server: '${{ secrets.CAPROVER_SERVER }}'
          app: '${{ secrets.CAPROVER_APP_NAME }}'
          token: '${{ secrets.CAPROVER_APP_TOKEN }}'
```

## Troubleshooting

### Common Issues

#### Deployment Fails

- Check the logs in the CapRover dashboard
- Verify that all required environment variables are set
- Ensure your server has enough resources (memory, disk space)

#### Database Migration Issues

- Verify the DATABASE_URL environment variable is correct
- Ensure the database file is writable by the container user
- Check the logs for specific migration errors

#### App Not Loading After Deployment

- Check if the container is running in the CapRover dashboard
- Verify the app is enabled and has a valid domain
- Check browser console for JavaScript errors
- Look at the server logs for any startup issues

#### HTTPS Not Working

- Verify your domain's DNS records are correct
- Check that CapRover's Let's Encrypt setup is working
- Ensure your firewall allows traffic on port 443

### Recovering from Deployment Failures

If a deployment fails and the application becomes inaccessible:

1. In the CapRover dashboard, go to your app's "Deployment" tab
2. Click "Deploy Now" and select a previous working version
3. If all deployments fail, you may need to recreate the app and restore from backup

## Backup and Restore

### Backing Up

1. Connect to your server via SSH
2. Back up the SQLite database:
   ```bash
   docker cp $(docker ps -q -f name=srv-captain--your-app-name):/app/prisma/dev.db ./backup_$(date +%Y%m%d).db
   ```
3. Back up the uploaded documents:
   ```bash
   docker cp $(docker ps -q -f name=srv-captain--your-app-name):/app/public/uploads ./uploads_backup_$(date +%Y%m%d)
   ```

### Creating a Complete Backup

For a full system backup:

```bash
# Create a backup directory
mkdir -p ~/backups/strata-website/$(date +%Y%m%d)

# Back up the database
docker cp $(docker ps -q -f name=srv-captain--your-app-name):/app/prisma/dev.db ~/backups/strata-website/$(date +%Y%m%d)/dev.db

# Back up the uploaded documents
docker cp $(docker ps -q -f name=srv-captain--your-app-name):/app/public/uploads ~/backups/strata-website/$(date +%Y%m%d)/uploads

# Archive the backup
tar -czvf ~/backups/strata-website-$(date +%Y%m%d).tar.gz ~/backups/strata-website/$(date +%Y%m%d)
```

### Restoring

1. Copy the backup database to the container:
   ```bash
   docker cp ./backup.db $(docker ps -q -f name=srv-captain--your-app-name):/app/prisma/dev.db
   ```
2. Restore the uploaded documents:
   ```bash
   docker cp ./uploads_backup $(docker ps -q -f name=srv-captain--your-app-name):/app/public/uploads
   ```
3. Restart the container:
   ```bash
   caprover restart -a your-app-name
   ```

## Scaling and Performance

### Vertical Scaling

To increase resources for your app in CapRover:

1. Go to your app's "App Configs" tab
2. Under "Resource Constraints", adjust CPU and memory limits

### Horizontal Scaling

For high-traffic websites:

1. Go to your app's "App Configs" tab
2. Under "Deployment", increase the number of instances

Note: When using multiple instances with SQLite, you'll need to implement a shared storage solution for the database file.

## Performance Optimization

1. Enable Nginx caching for static assets
2. Configure appropriate cache headers for documents
3. Consider using a CDN for document delivery

For more details, refer to the [CapRover documentation](https://caprover.com/docs/deployment-methods.html). 