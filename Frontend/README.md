# Blog Management System - Frontend

A modern, responsive frontend for the Blog Management System built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### User-Facing Blog Website

- **Home Page / Blog Feed**: Lists all published blog posts with title, excerpt, category, author, and thumbnail
- **Post Detail Page**: Displays full blog content with formatting, categories, tags, and related posts
- **Search & Filter**: Filter by category, tags, and keyword-based search
- **Pagination**: Smooth pagination for large post collections
- **Responsive Design**: Mobile-first responsive design

### Admin Panel Features

- **Authentication**: Secure login system for admin access
- **Dashboard**: Overview of blog statistics and recent activity
- **Post Management**: Create, edit, delete, and manage blog posts
- **Rich Text Editor**: TipTap editor with formatting, images, videos, and links
- **Categories & Tags**: Manage categories and tags with slug generation
- **File Management**: Upload and manage downloadable files
- **Download Requests**: Approve/deny user download requests
- **Post Preview**: Preview posts before publishing
- **Post Scheduling**: Schedule posts for future publication

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Rich Text Editor**: TipTap
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Utilities**: clsx, tailwind-merge

## 📦 Installation

1. **Navigate to the frontend directory**:

   ```bash
   cd Frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create environment file**:

   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_TYPE=user
   ```

## 🚀 Development

### Start Development Server

**For User-Facing Blog (Port 3000)**:

```bash
npm run dev:user
```

**For Admin Panel (Port 3001)**:

```bash
npm run dev:admin
```

**Default (Port 3000)**:

```bash
npm run dev
```

### Build for Production

**Build User-Facing Blog**:

```bash
npm run build:user
```

**Build Admin Panel**:

```bash
npm run build:admin
```

**Build Both**:

```bash
npm run build
```

## 📁 Project Structure

```
Frontend/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel routes
│   │   └── login/         # Admin login page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # User-facing homepage
│   └── providers.tsx      # React Query & Toaster providers
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
│   ├── api.ts            # API client
│   └── utils.ts          # Utility functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🎨 Components

### Core Components

- **PostCard**: Display individual blog posts
- **PostList**: Grid/list view of posts with pagination
- **SearchFilters**: Search and filter interface
- **RichTextEditor**: TipTap-based rich text editor
- **FileUpload**: Drag-and-drop file upload component
- **Pagination**: Page navigation component

### Admin Components

- **AdminLayout**: Admin panel layout with sidebar
- **Dashboard**: Admin dashboard with statistics
- **PostForm**: Create/edit post form
- **CategoryManager**: Category CRUD operations
- **TagManager**: Tag CRUD operations
- **FileManager**: File upload and management
- **DownloadRequests**: Manage download requests

## 🔌 API Integration

The frontend communicates with the backend through a centralized API client (`lib/api.ts`) that provides:

- **Authentication**: Login, logout, profile management
- **Posts**: CRUD operations, search, filtering
- **Categories**: CRUD operations
- **Tags**: CRUD operations
- **Files**: Upload, download, management
- **Download Requests**: Create, approve, deny requests

### API Features

- **Automatic Token Management**: JWT tokens handled automatically
- **Error Handling**: Centralized error handling and user feedback
- **Request/Response Interceptors**: Automatic auth header injection
- **Type Safety**: Full TypeScript support for API responses

## 🎯 Key Features

### User Experience

- **Fast Loading**: Optimized with React Query caching
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **SEO Optimized**: Meta tags and structured data
- **Progressive Enhancement**: Works without JavaScript

### Admin Experience

- **Rich Text Editing**: Full-featured TipTap editor
- **File Management**: Drag-and-drop file uploads
- **Real-time Preview**: Live post preview
- **Bulk Operations**: Multi-select and bulk actions
- **Advanced Filtering**: Complex search and filter options

### Developer Experience

- **Type Safety**: Full TypeScript coverage
- **Hot Reload**: Fast development with Next.js
- **Code Splitting**: Automatic code splitting
- **Error Boundaries**: Graceful error handling
- **Performance Monitoring**: Built-in performance tools

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_TYPE`: Application type (user/admin)

### Tailwind Configuration

- Custom color palette
- Typography plugin configuration
- Custom animations and utilities
- Responsive breakpoints

### Next.js Configuration

- Image optimization
- API route handling
- Static file serving
- Performance optimizations

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms

- **Netlify**: Configure build settings
- **AWS Amplify**: Connect repository and configure
- **Docker**: Use provided Dockerfile

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔒 Security

- **CSRF Protection**: Built-in Next.js protection
- **XSS Prevention**: Sanitized content rendering
- **Secure Headers**: Helmet.js integration
- **Input Validation**: Client and server-side validation
- **Authentication**: JWT token management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Optimized for all metrics
- **Bundle Size**: Optimized with tree shaking
- **Image Optimization**: Next.js Image component
- **Caching**: Strategic caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
