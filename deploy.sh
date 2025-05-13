#!/bin/bash

# CapRover Deployment Script
# This script prepares and deploys the application to CapRover

# Exit on error
set -e

echo "Starting deployment process for Strata Council Website..."

# Build the application
echo "Building application..."
npm run build

# Run type checking to catch any errors
echo "Running type check..."
npm run typecheck || { echo "Type check failed!"; exit 1; }

# Deploy to CapRover
echo "Deploying to CapRover..."
caprover deploy

echo "Deployment complete! The application should be live shortly."
echo "Remember to run database migrations on the server using:"
echo "  caprover deploy --appName strata-council --caproverUrl https://captain.yourdomain.com --appToken YOUR_APP_TOKEN"

# Instructions for first-time setup
echo ""
echo "For first-time deployment:"
echo "1. Log in to the CapRover dashboard"
echo "2. Go to Apps > Your App > Deployment"
echo "3. Run the following command on the server:"
echo "   docker exec -it $(docker ps -q -f name=srv-captain--strata-council) npx prisma migrate deploy"
echo ""
echo "This will apply all database migrations." 