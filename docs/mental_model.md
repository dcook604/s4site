# Strata Council Community Hub: Mental Model

## Core Concepts

### Content Management System
The Strata Council Community Hub is designed as a specialized CMS tailored for strata council websites. It focuses on simplifying content management for non-technical administrators while providing structured organization for strata-related documents and information.

### Information Architecture
The system organizes information around these core entities:
- **Pages**: Flexible content containers with rich text editing
- **Documents**: Uploadable files (primarily PDFs) with metadata and categorization
- **Navigation**: Hierarchical menu structure for intuitive site organization
- **Categories**: Classification system for documents to enhance findability

### User Roles and Access Control
The system operates on a simple but effective role-based access model:
- **Administrators**: Can manage all content, navigation, and users
- **Users**: Can view published content and access permitted documents

## System Architecture

> **Note (2024-06):** All import paths must be relative (e.g., `../lib/prisma`) rather than using path aliases like `@/lib/prisma`. This is required for compatibility with Docker and CapRover builds, which do not resolve TypeScript path aliases by default.

### Frontend-Backend Integration
The application uses Next.js to seamlessly blend frontend and backend capabilities:
- React components for UI rendering
- Next.js API routes for backend functionality
- Server-side rendering for improved SEO and performance

### Data Flow
1. **Content Creation**: Administrators create pages and upload documents
2. **Organization**: Content is categorized and linked to navigation
3. **Presentation**: Published content is rendered to users based on access control
4. **Retrieval**: Users browse and search for relevant information

### Security Model
- JWT-based authentication system
- Role-based access control for API routes and UI components
- Server-side validation for all user inputs
- Secure file handling for document uploads

## Design Philosophy

### Simplicity Over Complexity
The system prioritizes ease of use over feature complexity, focusing on the core needs of strata councils:
- Clear content organization
- Efficient document management
- Straightforward navigation
- Minimal learning curve for administrators

### Progressive Enhancement
The application is built to work effectively on all devices, with special attention to:
- Mobile responsiveness
- Accessibility compliance
- Performance optimization
- Graceful degradation when necessary

### Document-Centric Approach
Recognizing that strata councils primarily need to share official documents, the system provides:
- Robust document categorization
- Expiration date tracking
- Status indicators (active/archived)
- Efficient search and filtering

## Implementation Rationale

### Technology Choices
- **Next.js**: Provides unified frontend and backend capabilities with excellent SEO
- **Prisma**: Simplifies database operations with type safety
- **Chakra UI**: Ensures consistent, accessible UI components
- **SQLite**: Lightweight database suitable for moderate traffic needs
- **TipTap**: Rich text editing with a clean, customizable interface

### Deployment Strategy
The application is containerized with Docker and deployed via CapRover to:
- Simplify deployment and updates
- Ensure consistent environments
- Enable scaling if needed
- Minimize infrastructure management overhead

## Prisma Model Types (v6+)

> **Note:** Prisma v6+ does not export model types from `@prisma/client`. Use local type definitions or infer types from query results for type safety. 