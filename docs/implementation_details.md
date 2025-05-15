# Strata Council Community Hub: Implementation Details

> **Migration Note (2024-06):**
> All import paths must now be relative (e.g., `../lib/prisma`) instead of using path aliases like `@/lib/prisma`. This change is required for Docker/CapRover compatibility, as the build process does not resolve TypeScript path aliases. Update all imports accordingly to avoid build failures.

## Data Models

### User Model
The user model implements a simple role-based system:
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

Implementation notes:
- The password field stores bcrypt-hashed passwords
- Role field simply toggles between "admin" and "user" permissions
- NextAuth integration provides flexibility for future OAuth implementations

### Page Model
The page model serves as the core content container:
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

Implementation notes:
- Content is stored as a JSON string from TipTap editor
- Slugs are auto-generated from titles but can be customized
- Publishing workflow uses the isPublished flag for content staging

### Document System
The document system uses multiple models for flexible categorization:
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

Implementation notes:
- Many-to-many relationship between documents and categories
- File metadata stored in database, actual files on filesystem
- Cascade deletion ensures referential integrity
- Expiration dates enable automatic document lifecycle management

### Navigation System
The menu system supports hierarchical navigation:
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

Implementation notes:
- Self-referential relationship enables unlimited nesting
- SetNull ensures menu integrity if pages are deleted
- Order field enables custom sorting of menu items
- External links supported through the link field

## Authentication Implementation

The authentication system uses NextAuth.js with a custom credential provider:

1. **Login Flow**:
   - Username/password submitted to `/api/auth/signin`
   - Credentials validated against hashed passwords in database
   - JWT issued with user role and ID embedded
   - Session created and stored in browser cookies

2. **Authorization Logic**:
   - JWT verified on protected routes
   - Role checked for admin-only actions
   - API routes include middleware for permission checking
   - UI conditionally renders based on user role

3. **Security Considerations**:
   - Passwords hashed using bcrypt with 10 rounds
   - JWTs signed with server-side secret
   - Session tokens rotated for security
   - CSRF protection enabled by default

### Adding an Administrator User

To add an administrator user, update the Prisma seed script (`prisma/seed.ts`). The current seed script creates an admin user with:
- **Email:** dcook@spectrum4.ca
- **Password:** admin123 (bcrypt-hashed)
- **Role:** admin

To change the admin credentials, edit `prisma/seed.ts` and re-run:
```bash
npx prisma db seed
```

You can verify the user with Prisma Studio:
```bash
npx prisma studio
```

## File Storage Strategy

Document files are stored using the following approach:

1. **Upload Process**:
   - Files received via multipart form data
   - Validated for size and type (PDF, DOC, etc.)
   - Stored in `/public/uploads` directory with UUID filename
   - Metadata saved to database with original filename preserved

2. **Retrieval Process**:
   - Files served through API route `/api/documents/download/:id`
   - Permission check performed before serving
   - Content-Disposition header set for proper downloading
   - Content-Type set based on stored file type

3. **Storage Considerations**:
   - Files deployed as part of the application container
   - Backups should include the uploads directory
   - Volume mounting recommended for production deployment

## Rich Text Editor Implementation

The TipTap editor implementation:

1. **Editor Configuration**:
   - Uses StarterKit for basic formatting
   - Custom Link extension for hyperlinks
   - Placeholder extension for user guidance
   - Custom toolbar implementation

2. **Content Storage**:
   - Content stored as JSON in the database
   - Parsed and rendered on page load
   - Sanitized to prevent XSS attacks

3. **Content Rendering**:
   - Server-side rendered for SEO
   - Hydrated on client side for interactivity
   - Styled using Chakra UI components

## API Design

The API follows RESTful principles with these endpoints:

1. **Authentication**:
   - `POST /api/auth/signin`: Sign in with credentials
   - `POST /api/auth/signout`: Sign out
   - `GET /api/auth/session`: Get current session

2. **Pages**:
   - `GET /api/pages`: List all pages
   - `POST /api/pages`: Create a new page (admin only)
   - `GET /api/pages/:id`: Get page by ID
   - `PUT /api/pages/:id`: Update a page (admin only)
   - `DELETE /api/pages/:id`: Delete a page (admin only)

3. **Documents**:
   - `GET /api/documents`: List all documents
   - `POST /api/documents/upload`: Upload a new document (admin only)
   - `GET /api/documents/download/:id`: Download a document
   - `DELETE /api/documents/:id`: Delete a document (admin only)

4. **Categories**:
   - `GET /api/document-categories`: List all document categories
   - `POST /api/document-categories`: Create a new category (admin only)
   - `PUT /api/document-categories/:id`: Update a category (admin only)
   - `DELETE /api/document-categories/:id`: Delete a category (admin only)

5. **Menu Management**:
   - `GET /api/menus`: Get all menu items
   - `POST /api/menus`: Create or update menu structure (admin only)

## Performance Optimizations

The application includes several performance optimizations:

1. **Server-Side Rendering**:
   - Critical pages pre-rendered on server
   - Data fetching during build when possible
   - Dynamic routes for user-specific content

2. **Database Efficiency**:
   - Prisma query optimization
   - Selective fetching of related data
   - Pagination for large data sets

3. **Frontend Performance**:
   - Component code splitting
   - Image optimization with Next.js Image component
   - Client-side caching of frequent data

4. **Build Process**:
   - Next.js production optimization
   - Static generation where appropriate
   - Efficient bundle size management

### Prisma Model Types (v6+)

> **Note:** As of Prisma v6+, model types (e.g., `Page`, `User`, `Document`) are no longer exported directly from `@prisma/client`. Instead, you should define local TypeScript types matching your schema, or infer types from query results. See [Prisma documentation](https://www.prisma.io/docs/orm/prisma-client/type-safety). 

### Type Inference with Prisma Select Queries

When using Prisma's `select` option in queries (e.g., `findMany({ select: ... })`), the returned array elements are typed according to the selected fields. To avoid TypeScript errors, always provide explicit types for parameters in mapping functions (e.g., `.map((item: { id: string; ... }) => ...)`).

See: [Prisma Type Safety: select](https://www.prisma.io/docs/orm/prisma-client/type-safety/select) 

### SQLite Permissions in Docker/CapRover

When deploying with SQLite in Docker (e.g., CapRover), ensure the application user (e.g., `nextjs`) has write permissions to the database and migrations directory (`/app/prisma`).

- In the Dockerfile, add:
  ```dockerfile
  RUN chown -R 1001:1001 /app/prisma
  ```
  before switching to the non-root user.
- This prevents "readonly database" errors when writing to SQLite. 