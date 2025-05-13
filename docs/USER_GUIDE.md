# Strata Council Website User Guide

## Introduction

Welcome to the Strata Council Community Hub user guide. This document provides an overview of the system's features and how to use them effectively. The website is designed to be intuitive and user-friendly, helping strata council members access and share important information.

## User Roles

The system has two user roles with distinct permissions:

### Administrator Role

Administrators have full access to manage the website content:

- **Page Management**: Create, edit, and publish pages with the WYSIWYG editor
- **Menu Management**: Organize the navigation structure of the website
- **Document Management**: Upload, categorize, and manage documents
- **User Management**: View and manage user accounts

Administrators can access the admin dashboard at `/admin` after logging in.

### Regular User Role

Regular users have limited access focused on viewing content:

- View published pages and access public content
- Browse, search, and download documents
- Filter documents by categories
- Cannot access the admin dashboard or management features

## Document Management System

### Browsing Documents

All users can browse documents through the document library:

1. Navigate to the Documents section from the main menu
2. Documents are displayed in a grid with key information:
   - Title and description
   - Upload date
   - Status (active, expired, archived)
   - Category badges

### Searching for Documents

The system offers multiple ways to find documents:

1. **Global Search**:
   - Use the search bar in the top navigation
   - Enter keywords related to document titles or content
   - Results will show matching documents with highlighted terms

2. **Category Filtering**:
   - Click on a category badge to filter documents by that category
   - Use the category filter dropdown to select multiple categories
   - Clear filters using the "Clear all" button

3. **Browse by Category**:
   - Navigate to Documents > Categories
   - Select a category to view all documents in that category
   - Categories are color-coded for easy identification

### Downloading Documents

To download a document:

1. Click on the document title or thumbnail to view details
2. Click the "Download Document" button 
3. The PDF will be downloaded to your device

### Understanding Document Status

Documents can have different statuses:

- **Active**: Default status for all documents
- **Expired**: Documents past their expiration date (shown with a red badge)
- **Archived**: Documents that have been archived by administrators

### Uploading Documents (Administrators)

Administrators can upload documents through the admin interface:

1. Navigate to Admin > Documents > Upload Document
2. Fill in the document details:
   - Title: A descriptive name for the document (required)
   - Description (optional): Information about the document's content
   - Associated Page (optional): Link to a specific page
   - Expiration Date (optional): When the document will be marked as expired
3. Select PDF file to upload (max 10MB)
4. Choose categories to assign to the document
5. Click "Upload Document"

### Document Categories

Categories help organize documents and make them easier to find:

#### Creating Categories (Administrators)

1. Navigate to Admin > Document Categories
2. Click "Create Category"
3. Fill in:
   - Name: Category name (required)
   - Description: Brief explanation (optional)
   - Color: Choose a color for visual identification (optional)
4. Click "Create"

#### Assigning Categories to Documents (Administrators)

1. Navigate to Admin > Documents
2. Click the category icon next to a document
3. Select the categories to assign
4. Click "Save Categories"

Alternatively, categories can be assigned during document upload.

#### Managing Document Status (Administrators)

Administrators can manage document status:

1. **Setting Expiration Dates**:
   - When uploading or editing a document, set the Expiration Date field
   - Documents will automatically be marked as expired after this date
   - Expired documents remain accessible but are clearly marked

2. **Archiving Documents**:
   - Navigate to Admin > Documents
   - Click on the document to edit
   - Check the "Archive this document" option
   - Archived documents are moved to the bottom of lists and marked accordingly

## Page Management (Administrators)

### Creating Pages

1. Navigate to Admin > Pages
2. Click "New Page"
3. Fill in:
   - Title: Page title (required)
   - Slug: URL-friendly name (auto-generated, but can be customized)
   - Content: Use the WYSIWYG editor to create content
4. Click "Save as Draft" or "Publish"

### Editing Pages

1. Navigate to Admin > Pages
2. Click on the page title to edit
3. Make changes to the content using the WYSIWYG editor
4. Click "Update" to save changes

### WYSIWYG Editor Features

The rich text editor includes:

- Text formatting (bold, italic, underline)
- Lists (ordered and unordered)
- Headings (H1-H6)
- Links
- Images
- Tables
- Code blocks
- Quotes

## Menu Management (Administrators)

### Creating Menu Items

1. Navigate to Admin > Menu
2. Click "Add Item"
3. Fill in:
   - Label: Text to display in the menu
   - Link Type: Page (internal) or URL (external)
   - Select a page or enter a URL
   - Parent Item: Optionally nest under another menu item
4. Click "Add Item"

### Organizing Menu Structure

1. Drag and drop menu items to change their order
2. Use the indentation controls to create submenu items
3. Click "Save Menu" to apply changes

## Best Practices

### For Administrators

- Use clear, descriptive names for document categories
- Assign meaningful colors to categories for visual organization
- Set expiration dates for time-sensitive documents
- Regularly review and archive outdated documents
- Use multiple categories when appropriate to make documents easier to find
- Keep page titles concise and descriptive
- Organize menu items logically for easy navigation
- Use consistent naming conventions for documents and pages

### For Users

- Use the category filtering to quickly find relevant documents
- Check document expiration dates to ensure you're viewing current information
- Use the search function to find documents by title or description
- Bookmark frequently accessed pages for quick access

## Accessibility Features

The website includes several accessibility features:

- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Resizable text
- Alt text for images
- ARIA attributes for complex components

## Troubleshooting

If you encounter issues:

- **Cannot access admin features**: Ensure your account has administrator role
- **Document upload fails**: Check that the file is in PDF format and under 10MB
- **Categories not appearing**: Contact an administrator to create categories
- **Search not returning expected results**: Try different keywords or browse by category

For additional help, contact the system administrator. 