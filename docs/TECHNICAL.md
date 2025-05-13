# Strata Council Website - Technical Documentation

## System Requirements

### Development Environment
- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **Git**: Any recent version

### Server Requirements
- **Server**: Any server capable of running Node.js applications (Linux VPS recommended)
- **CapRover**: Installed and configured on the server
- **Storage**: At least 2GB for the application, database, and document storage
- **Memory**: Minimum 1GB RAM
- **HTTPS**: SSL certificate (provided by CapRover)

## Application Architecture

The application is built using Next.js and follows a modern architecture pattern:

### Front-end
- **Framework**: Next.js 13 with TypeScript
- **UI Library**: Chakra UI for responsive, accessible components
- **State Management**: React's built-in hooks
- **Authentication**: NextAuth.js with JWT
- **Rich Text Editor**: TipTap WYSIWYG editor

### Back-end
- **API Routes**: Next.js serverless API functions
- **Database ORM**: Prisma with SQLite
- **File Storage**: Local filesystem (within container)
- **Authentication**: NextAuth.js with custom JWT handling

### Security Features
- Role-based access control (RBAC)
- JWT-based authentication
- Server-side session validation
- Password hashing with bcrypt
- File type validation for uploads

## Database Schema

The database is managed through Prisma and includes the following main models:

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String    @default("user") // "admin" or "user"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  pages         Page[]
  accounts      Account[]
  sessions      Session[]
}
```

### Page Model
```prisma
model Page {
  id         String    @id @default(cuid())
  title      String
  slug       String    @unique
  content    String    // JSON content from WYSIWYG editor
  isPublished Boolean  @default(false)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  authorId   String
  author     User      @relation(fields: [authorId], references: [id])
  menuItems  MenuItem[]
  documents  Document[]
}
```

### Document Model
```prisma
model Document {
  id          String   @id @default(cuid())
  title       String
  fileName    String
  fileSize    Int
  fileType    String
  description String?
  pageId      String?
  page        Page?    @relation(fields: [pageId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  categories  DocumentsOnCategories[]
  expiresAt   DateTime?
  isArchived  Boolean  @default(false)
}
```

### Document Category Models
```prisma
model DocumentCategory {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  documents   DocumentsOnCategories[]
}

model DocumentsOnCategories {
  document     Document        @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId   String
  category     DocumentCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId   String
  assignedAt   DateTime        @default(now())

  @@id([documentId, categoryId])
}
```

### Menu Models
```prisma
model MenuItem {
  id       String    @id @default(cuid())
  label    String
  link     String?
  pageId   String?
  page     Page?     @relation(fields: [pageId], references: [id], onDelete: SetNull)
  parentId String?
  parent   MenuItem? @relation("MenuItemToMenuItem", fields: [parentId], references: [id], onDelete: SetNull)
  children MenuItem[] @relation("MenuItemToMenuItem")
  order    Int       @default(0)
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signin`: Sign in with credentials
- `POST /api/auth/signout`: Sign out
- `GET /api/auth/session`: Get current session

### Pages
- `GET /api/pages`: List all pages
- `POST /api/pages`: Create a new page (admin only)
- `GET /api/pages/:id`: Get page by ID
- `PUT /api/pages/:id`: Update a page (admin only)
- `DELETE /api/pages/:id`: Delete a page (admin only)

### Documents
- `GET /api/documents`: List all documents
- `POST /api/documents/upload`: Upload a new document (admin only)
- `GET /api/documents/download/:id`: Download a document
- `DELETE /api/documents/:id`: Delete a document (admin only)

### Document Categories
- `GET /api/document-categories`: List all document categories
- `POST /api/document-categories`: Create a new category (admin only)
- `GET /api/document-categories/:id`: Get category by ID
- `PUT /api/document-categories/:id`: Update a category (admin only)
- `DELETE /api/document-categories/:id`: Delete a category (admin only)
- `POST /api/documents/categories/assign`: Assign categories to a document (admin only)

### Menu Management
- `GET /api/menus`: Get all menu items
- `POST /api/menus`: Create or update menu structure (admin only)

## Environment Variables

The application requires the following environment variables:

```
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Optional: Email (for future password reset functionality)
EMAIL_SERVER=
EMAIL_FROM=
```

## User Roles and Permissions

### Administrator Role (role="admin")
- Full access to admin dashboard
- Create, edit, and delete pages
- Publish and unpublish pages
- Upload, categorize, and manage documents
- Create and manage document categories
- Configure and manage navigation menus
- View all site content

### Regular User Role (role="user")
- View published pages
- View and download documents
- Browse document categories
- Cannot access admin features or dashboard
- Cannot create or modify content

## Document Categorization System

The document categorization system allows:

1. **Creation of Categories**:
   - Each category has a name, optional description, and optional color
   - Colors provide visual identification in the UI

2. **Many-to-Many Relationships**:
   - Documents can belong to multiple categories
   - Categories can contain multiple documents
   - Join table (DocumentsOnCategories) tracks these relationships

3. **Document Status Tracking**:
   - Active: Default status
   - Expired: Based on optional expiresAt date
   - Archived: Manually set by administrators

4. **UI Features**:
   - Color-coded category badges
   - Filtering documents by category
   - Search within categories
   - Visual indicators for document status

## Security Considerations

1. **Authentication**:
   - Uses JWT-based authentication
   - Passwords are hashed using bcrypt
   - Session tokens are stored in HTTP-only cookies

2. **Authorization**:
   - Role-based access control for all admin routes
   - Server-side validation of permissions
   - Client-side UI adapts based on user role

3. **File Uploads**:
   - File type validation (PDF only)
   - File size limits (10MB)
   - Secure storage within container

4. **API Protection**:
   - All admin APIs check for valid session and admin role
   - Rate limiting on authentication endpoints

## Performance Optimization

1. **Static Generation**:
   - Home page and public pages use static generation where possible
   - Admin dashboard uses server-side rendering for real-time data

2. **Image Optimization**:
   - Next.js Image component for optimized image delivery
   - Lazy loading for document lists

3. **Code Splitting**:
   - Automatic code splitting by Next.js
   - Dynamic imports for large components

## Backup and Recovery

1. **Database Backup**:
   - SQLite database can be backed up using simple file copy
   - Regular backups recommended via cron jobs

2. **Document Backup**:
   - All uploaded documents stored in `/public/uploads/pdfs`
   - Should be included in backup strategy

3. **Recovery Procedure**:
   - Restore SQLite database file
   - Restore document files to appropriate directory
   - Restart application

## Limitations and Known Issues

1. **Document Storage**:
   - Documents are stored in the container filesystem
   - For production with multiple instances, consider external storage solution

2. **SQLite Limitations**:
   - Suitable for low to medium traffic
   - For high concurrency, consider migrating to PostgreSQL

3. **Session Management**:
   - JWT-based sessions have fixed expiration
   - No explicit session termination for all user sessions 