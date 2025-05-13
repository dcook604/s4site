#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process for Strata Council Website to CapRover..."

# Build the application
echo "Building application..."
npm run build

# Run type checking to catch any errors
echo "Running type check..."
npm run typecheck || { echo "Type check failed!"; exit 1; }

# Create deployment tar file
echo "Creating deployment package..."
tar -cf ../website-deploy.tar --exclude="node_modules" --exclude=".git" --exclude=".next/cache" .

echo "Deploying to CapRover..."
echo "You will be prompted to select a CapRover instance and create/select an app."
echo "If 'strata-website' doesn't exist, you need to create it first in the CapRover dashboard."

# Deploy to CapRover
caprover deploy -t ../website-deploy.tar

echo -e "\nIMPORTANT POST-DEPLOYMENT STEPS:"
echo "1. Set these environment variables in the CapRover dashboard (App → Settings → Environmental Variables):"
echo "   DATABASE_URL=file:/app/prisma/dev.db"
echo "   NEXTAUTH_URL=https://your-app-domain.com"
echo "   NEXTAUTH_SECRET=[generate a secret with 'openssl rand -base64 32']"
echo 
echo "2. Run database migrations with:"
echo "   docker exec -it \$(docker ps -q -f name=srv-captain--strata-website) npx prisma migrate deploy"
echo
echo "3. Create your admin account by visiting /auth/signup on your deployed site"
echo
echo "For more deployment details, see docs/DEPLOYMENT.md" 