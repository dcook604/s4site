# Strata Council Community Hub

A modern, streamlined content management system for strata council websites. This application allows administrators to create and manage pages with a WYSIWYG editor, organize navigation menus, and upload PDF documents for residents. The system includes a document categorization feature to help organize and find important documents easily.

## Features

- **Content Management**: Create and edit pages with a rich text editor
- **Dynamic Navigation**: Manage menu items and organize page hierarchy
- **Document Management**: Upload and categorize PDF documents with expiration dates
- **Document Categories**: Organize documents into color-coded categories for easy navigation
- **User Authentication**: Secure login for administrators and users with role-based access control
- **Responsive Design**: Mobile-friendly interface for all devices

## System Requirements

### Development Environment
- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **Git**: Any recent version
- **Storage**: At least 500MB for development files and database

### Production Environment
- **Server**: Any server capable of running Docker containers
- **CapRover**: Installed and configured on the server
- **Storage**: At least 2GB for the application, database, and document storage
- **Memory**: Minimum 1GB RAM
- **HTTPS**: SSL certificate (provided by CapRover)

## Tech Stack

- **Frontend**: Next.js 13+, TypeScript, Chakra UI
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma)
- **Authentication**: NextAuth.js with JWT
- **Editor**: TipTap WYSIWYG editor
- **Deployment**: CapRover on VPS

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd projects/website
npm install
```

3. Set up environment variables:

```bash
# Create .env file
cp .env.example .env
```

4. Initialize the database:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## Deployment on CapRover

This project is configured for easy deployment on CapRover.

1. Make sure you have CapRover CLI installed:

```bash
npm install -g caprover
```

2. Build and deploy:

```bash
# Log in to your CapRover instance
caprover login

# Deploy the application
caprover deploy
```

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## User Roles and Permissions

The application supports two user roles with different permissions:

### Administrator Role
- Create, edit, and delete pages
- Manage navigation menus
- Upload, categorize, and manage documents
- Create and manage document categories
- Access the admin dashboard

### User Role
- View published pages and documents
- Download documents
- Browse document categories
- Cannot access admin features

For more details on user roles and permissions, see [TECHNICAL.md](docs/TECHNICAL.md).

## Administrator Account Setup

The first time you run the application, you'll need to create an admin account:

1. Navigate to `/auth/signup` (this route will be disabled after the first admin is created)
2. Create your account with your email and password
3. The first user will automatically be assigned the admin role

## Project Structure

- `/pages`: Next.js pages and API routes
- `/components`: Reusable UI components
- `/lib`: Utility functions and Prisma client
- `/prisma`: Database schema and migrations
- `/public`: Static assets
- `/styles`: Global CSS styles
- `/docs`: Project documentation

## Document Categories Feature

The document categorization system allows administrators to:

- Create custom categories with names, descriptions, and colors
- Assign multiple categories to each document
- Filter documents by category
- Display color-coded category badges for visual organization
- Track document status (active, expired, archived)

This feature helps strata council members find relevant documents quickly and keeps the document library organized.

## Environment Variables

The application requires the following environment variables:

```
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## Documentation

Detailed documentation can be found in the `/docs` directory:

- [User Guide](docs/USER_GUIDE.md): Instructions for using the application
- [Deployment Guide](docs/DEPLOYMENT.md): Instructions for deploying the application
- [Technical Documentation](docs/TECHNICAL.md): Technical details about the application architecture
- [Requirements](docs/REQUIREMENTS.md): Comprehensive functional and non-functional requirements

## License

This project is licensed under the MIT License - see the LICENSE file for details. 