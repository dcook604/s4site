# Strata Council Community Hub: Gotchas

## Import Path Aliasing and Docker/CapRover
- **Issue:** TypeScript path aliases (e.g., `@/lib/prisma`) are not resolved by Next.js in Docker/CapRover builds, causing build failures.
- **Workaround:** Use only relative import paths (e.g., `../../../lib/prisma`) throughout the codebase.
- **Note:** This is a hard requirement for production deployment with Docker/CapRover.

This document contains known issues, caveats, edge cases, and workarounds for the Strata Council Community Hub application.

## Authentication & Authorization

### First User Creation
- **Issue**: The first user must be manually assigned the admin role since there's no admin to approve it
- **Workaround**: The `/auth/signup` route automatically assigns admin role to the first user created in the system
- **Note**: Disable this route or add additional validation after initial setup for security reasons

### Session Expiration
- **Issue**: NextAuth sessions expire after default time (30 days) which may be unexpected
- **Workaround**: Set `maxAge` parameter in NextAuth config to extend or shorten based on security needs
- **Note**: Token rotation is enabled by default, so even long-lived sessions have refreshed tokens

### Password Reset
- **Issue**: Password reset functionality requires email configuration
- **Workaround**: Until email is configured, administrators must manually reset passwords in the database
- **Note**: Email provider configuration is commented out in the NextAuth configuration

## File Management

### File Size Limits
- **Issue**: Large file uploads may fail due to default Next.js API limits
- **Workaround**: The `api/config.js` sets `bodyParser: false` and uses formidable with increased limits
- **Note**: Very large files (>50MB) may still cause timeouts depending on server configuration

### File Storage
- **Issue**: Files stored in the container may be lost on redeployment
- **Workaround**: Configure volume mapping in CapRover for `/public/uploads` directory
- **Note**: Backup procedures should include the uploads directory

### File Types
- **Issue**: Some PDF files may not display correctly in the browser preview
- **Workaround**: Always download files for the most reliable viewing experience
- **Note**: The system enforces file type checks to prevent uploading executable or risky files

## Database

### SQLite Limitations
- **Issue**: SQLite may have concurrency limitations under heavy load
- **Workaround**: The application implements connection pooling and retry logic for common operations
- **Note**: Consider migrating to PostgreSQL for higher traffic sites by changing the Prisma provider

### Database Backups
- **Issue**: No automatic database backup mechanism is included
- **Workaround**: Implement a cron job to backup the SQLite database file regularly
- **Note**: The database file is located at `prisma/dev.db` in development and production

### Migration Failures
- **Issue**: Schema migrations may fail if database is in use
- **Workaround**: Ensure the application is fully stopped before running migrations
- **Note**: Always backup the database before migrations

## Content Management

### Rich Text Editor Quirks
- **Issue**: TipTap editor may have unexpected behavior with certain HTML content
- **Workaround**: Use the editor's built-in formatting tools rather than pasting complex HTML
- **Note**: The editor sanitizes content to prevent XSS, which may strip some formatting

### Menu Ordering
- **Issue**: Menu item ordering may be inconsistent when items have the same order value
- **Workaround**: Always set explicit order values that are unique within the same menu level
- **Note**: The UI enforces this but the API does not, so direct API calls should handle this

### Slug Conflicts
- **Issue**: Creating pages with similar titles may cause slug conflicts
- **Workaround**: The system automatically appends numbers to conflicting slugs
- **Note**: Slugs can be manually edited for better readability and SEO

## User Interface

### Mobile Navigation
- **Issue**: Deep nested menus may be difficult to navigate on mobile devices
- **Workaround**: Limit menu nesting to 2 levels for better mobile compatibility
- **Note**: The mobile menu uses a collapsed accordion-style navigation

### Form Validation
- **Issue**: Some form error messages may not be descriptive enough
- **Workaround**: Check the browser console for more detailed validation errors
- **Note**: Server-side validation provides additional security but may be less descriptive

### Content Preview
- **Issue**: Content preview may render differently than the published version
- **Workaround**: Use the "Preview" button to see the exact published rendering
- **Note**: Styles are standardized between preview and published views, but some edge cases exist

## Deployment

### CapRover Memory
- **Issue**: Default CapRover containers may have limited memory
- **Workaround**: Increase container memory allocation in CapRover dashboard
- **Note**: 512MB is minimum recommended, 1GB is preferred for better performance

### HTTPS Redirect
- **Issue**: HTTP requests may not always redirect to HTTPS
- **Workaround**: Configure CapRover to force HTTPS or add middleware in Next.js configuration
- **Note**: The application includes HSTS headers when served over HTTPS

### Container Rebuilds
- **Issue**: Rebuilding the container deletes all file uploads
- **Workaround**: Use persistent volumes for `/public/uploads` directory
- **Note**: Include detailed volume configuration in deployment documentation

## Performance

### Initial Load Time
- **Issue**: First page load may be slow due to Next.js hydration
- **Workaround**: Implemented selective hydration and code splitting to minimize impact
- **Note**: Subsequent navigation is much faster due to client-side routing

### Document Listing Performance
- **Issue**: Listing many documents with categories may be slow
- **Workaround**: Pagination is implemented with a default 20 items per page
- **Note**: Consider implementing virtual scrolling for very large document libraries

### Search Performance
- **Issue**: Full-text search is implemented client-side and may be slow with large datasets
- **Workaround**: Search indexes are built and cached for better performance
- **Note**: Consider implementing server-side search for very large sites 

## Prisma v6+ Model Types Not Exported

- **Issue:** Prisma v6+ does not export model types (e.g., `Page`, `User`, `Document`) from `@prisma/client`.
- **Workaround:** Define local TypeScript types matching your schema, or infer types from query results.
- **Reference:** [Prisma v6+ Type Safety](https://www.prisma.io/docs/orm/prisma-client/type-safety) 