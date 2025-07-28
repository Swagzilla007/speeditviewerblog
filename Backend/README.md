# Blog Management System - Backend

A comprehensive Node.js backend for a blog management system with admin panel and public website functionality.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Blog Post Management**: CRUD operations for blog posts with rich content support
- **Categories & Tags**: Full management of categories and tags with slug generation
- **File Management**: Secure file upload and download system
- **Download Requests**: Approval workflow for file downloads
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient pagination for all list endpoints
- **Security**: Input validation, rate limiting, and security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory**

   ```bash
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=blog_management
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h

   # File Upload Configuration
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up the database**

   ```bash
   # Create database and tables
   mysql -u root -p < database/schema.sql
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Default Admin Account

After running the database schema, a default admin account is created:

- **Username**: admin
- **Password**: admin123
- **Email**: admin@blog.com

**Important**: Change the default password after first login!

## API Endpoints

### Authentication

- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/register` - Create new user (admin only)
- `PUT /api/auth/change-password` - Change password

### Posts

- `GET /api/posts` - Get all posts (with pagination, search, filters)
- `GET /api/posts/:slug` - Get single post by slug
- `POST /api/posts` - Create new post (admin only)
- `PUT /api/posts/:id` - Update post (admin only)
- `DELETE /api/posts/:id` - Delete post (admin only)

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Tags

- `GET /api/tags` - Get all tags
- `GET /api/tags/:slug` - Get tag by slug
- `POST /api/tags` - Create tag (admin only)
- `PUT /api/tags/:id` - Update tag (admin only)
- `DELETE /api/tags/:id` - Delete tag (admin only)

### Files

- `POST /api/files/upload` - Upload file (admin only)
- `GET /api/files` - Get all files (admin only)
- `GET /api/files/:id` - Get file info
- `GET /api/files/:id/download` - Download file (with access control)
- `PUT /api/files/:id` - Update file (admin only)
- `DELETE /api/files/:id` - Delete file (admin only)

### Download Requests

- `POST /api/download-requests` - Create download request
- `GET /api/download-requests/my-requests` - Get user's requests
- `GET /api/download-requests` - Get all requests (admin only)
- `GET /api/download-requests/:id` - Get single request
- `PUT /api/download-requests/:id` - Update request status (admin only)
- `DELETE /api/download-requests/:id` - Delete request (admin only)

## Query Parameters

### Posts Endpoints

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term for title, excerpt, or content
- `category` - Filter by category slug
- `tag` - Filter by tag slug
- `status` - Filter by post status (draft, published, archived)

### Files Endpoints

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `postId` - Filter by post ID

### Download Requests Endpoints

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10 for user, 20 for admin)
- `status` - Filter by request status (pending, approved, rejected)

## File Upload

The system supports various file types:

- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- **Archives**: ZIP, RAR

Maximum file size: 10MB (configurable)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and user roles
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Prevents abuse with configurable limits
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS settings
- **File Type Validation**: Whitelist of allowed file types
- **SQL Injection Protection**: Parameterized queries

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

The database schema is included in `database/schema.sql`. Run this file to set up the database structure.

### Environment Variables

See `env.example` for all available environment variables and their descriptions.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Configure proper database credentials
4. Set up proper CORS origins
5. Use HTTPS in production
6. Configure proper file upload limits
7. Set up logging and monitoring

## License

MIT License
