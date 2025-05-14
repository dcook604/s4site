#!/bin/bash

# Exit on error
set -e

echo "Starting Git-based deployment process for Strata Council Website to CapRover..."

# Check if git remote is set up
if ! git remote | grep -q origin; then
  echo "Error: Git remote 'origin' is not set up."
  echo "Please set up a remote repository first with:"
  echo "  git remote add origin <your-repository-url>"
  exit 1
fi

# Build the application locally to check for errors
echo "Building application locally to check for errors..."
npm run build

# Run type checking to catch any errors
echo "Running type check..."
npm run typecheck || { echo "Type check failed!"; exit 1; }

# Commit any changes
echo "Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
  echo "There are uncommitted changes. Do you want to commit them? (y/n)"
  read -r answer
  if [ "$answer" == "y" ]; then
    echo "Enter commit message:"
    read -r commit_message
    git add .
    git commit -m "$commit_message"
  else
    echo "Aborted. Please commit your changes manually."
    exit 1
  fi
fi

# Push to remote repository
echo "Pushing to remote repository..."
git push origin main || { echo "Push failed. Please fix issues and try again."; exit 1; }

echo "Code pushed to remote repository successfully."
echo "Now deploying to CapRover..."

# Prompt for CapRover app name
echo "Enter the name of your CapRover app (default: strata-website):"
read -r app_name
app_name=${app_name:-strata-website}

# Get the git remote URL
remote_url=$(git remote get-url origin)

echo "Deploying to CapRover app '$app_name' using Git repository..."
echo "Using repository URL: $remote_url"

# Deploy to CapRover using Git
echo "Running CapRover deploy command..."

caprover deploy -n captain-01 -a "$app_name" -b main

echo -e "\nIMPORTANT POST-DEPLOYMENT STEPS:"
echo "1. Set these environment variables in the CapRover dashboard (App → Settings → Environmental Variables):"
echo "   DATABASE_URL=file:/app/prisma/dev.db"
echo "   NEXTAUTH_URL=https://your-app-domain.com"
echo "   NEXTAUTH_SECRET=[generate a secret with 'openssl rand -base64 32']"
echo 
echo "2. Run database migrations with:"
echo "   docker exec -it \$(docker ps -q -f name=srv-captain--$app_name) npx prisma migrate deploy"
echo
echo "3. Create your admin account by visiting /auth/signup on your deployed site"
echo
echo "For more deployment details, see docs/DEPLOYMENT.md" 