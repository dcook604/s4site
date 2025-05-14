# Strata Council Community Hub: Quick Reference

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | SQLite database connection URL | `file:./dev.db` | Yes |
| `NEXTAUTH_URL` | URL of the application for authentication | `http://localhost:3000` | Yes |
| `NEXTAUTH_SECRET` | Secret key for JWT tokens | None | Yes |
| `EMAIL_SERVER` | SMTP server for email notifications | None | No |
| `EMAIL_FROM` | Email address to send notifications from | None | No |

## API Endpoints

### Authentication
```
POST /api/auth/signin
  - Body: { email, password }
  - Returns: JWT session

POST /api/auth/signout
  - Returns: Success message

GET /api/auth/session
  - Returns: Current session data
```

### Pages
```
GET /api/pages
  - Query: { published: boolean }
  - Returns: List of pages

POST /api/pages
  - Body: { title, content, isPublished }
  - Returns: Created page

GET /api/pages/:id
  - Returns: Page details

PUT /api/pages/:id
  - Body: { title, content, isPublished }
  - Returns: Updated page

DELETE /api/pages/:id
  - Returns: Success message
```

### Documents
```
GET /api/documents
  - Query: { category: string, archived: boolean, page: number, limit: number }
  - Returns: Paginated documents

POST /api/documents/upload
  - Body: multipart/form-data with { title, description, file, pageId?, categories[] }
  - Returns: Created document

GET /api/documents/download/:id
  - Returns: Document file with appropriate headers

DELETE /api/documents/:id
  - Returns: Success message
```

### Document Categories
```
GET /api/document-categories
  - Returns: List of categories

POST /api/document-categories
  - Body: { name, description, color }
  - Returns: Created category

PUT /api/document-categories/:id
  - Body: { name, description, color }
  - Returns: Updated category

DELETE /api/document-categories/:id
  - Returns: Success message

POST /api/documents/categories/assign
  - Body: { documentId, categoryIds: string[] }
  - Returns: Updated document with categories
```

### Menu Management
```
GET /api/menus
  - Returns: Hierarchical menu structure

POST /api/menus
  - Body: Array of menu items with { id, label, link, pageId, parentId, order }
  - Returns: Updated menu structure
```

## Command Reference

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript checks
npm run typecheck

# Lint code
npm run lint
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name <migration-name>

# Push schema changes without migration
npx prisma db push

# View database in Prisma Studio
npx prisma studio
```

### Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to CapRover
npm run deploy
# or use the script
./deployToCaprover.sh

# Deploy with Git
./deployWithGit.sh
```

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (cuid) |
| `name` | String? | User's display name |
| `email` | String? | User's email address (unique) |
| `password` | String? | Hashed password |
| `role` | String | User role ("admin" or "user") |
| `emailVerified` | DateTime? | When email was verified |
| `image` | String? | Profile image URL |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Page
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (cuid) |
| `title` | String | Page title |
| `slug` | String | URL-friendly identifier (unique) |
| `content` | String | JSON content from editor |
| `isPublished` | Boolean | Publication status |
| `authorId` | String | Creator's user ID |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Document
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (cuid) |
| `title` | String | Document title |
| `fileName` | String | Original filename |
| `fileSize` | Int | Size in bytes |
| `fileType` | String | MIME type |
| `description` | String? | Optional description |
| `pageId` | String? | Associated page ID |
| `expiresAt` | DateTime? | Expiration date |
| `isArchived` | Boolean | Archive status |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### DocumentCategory
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (cuid) |
| `name` | String | Category name |
| `description` | String? | Optional description |
| `color` | String? | Hex color code for UI |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### MenuItem
| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (cuid) |
| `label` | String | Display text |
| `link` | String? | External URL (optional) |
| `pageId` | String? | Internal page reference |
| `parentId` | String? | Parent menu item ID |
| `order` | Int | Sort order |

## Permissions Reference

| Action | Admin | User |
|--------|-------|------|
| View published pages | ✅ | ✅ |
| View unpublished pages | ✅ | ❌ |
| Create/edit pages | ✅ | ❌ |
| Delete pages | ✅ | ❌ |
| Upload documents | ✅ | ❌ |
| View documents | ✅ | ✅ |
| Download documents | ✅ | ✅ |
| Delete documents | ✅ | ❌ |
| Manage categories | ✅ | ❌ |
| Configure menus | ✅ | ❌ |

## UI Component Reference

### Page Components
- `<PageEditor />`: WYSIWYG editor for page content
- `<PageContent />`: Renders published page content
- `<PageList />`: Displays paginated list of pages
- `<PageControls />`: Admin controls for page management

### Document Components
- `<DocumentUploader />`: File upload with metadata form
- `<DocumentList />`: Filterable document listing with categories
- `<DocumentCard />`: Individual document display with actions
- `<CategoryManager />`: Create and edit document categories

### Navigation Components
- `<MainNavigation />`: Primary site navigation
- `<MenuEditor />`: Drag-and-drop menu configuration
- `<MobileMenu />`: Responsive navigation for small screens
- `<BreadcrumbTrail />`: Hierarchical page location indicator 

## Prisma Model Types (v6+)

> **Note:** Prisma v6+ does not export model types from `@prisma/client`. Use local type definitions or infer types from query results.

**Example:**
```ts
// Define a local type for Page
export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
};
``` 