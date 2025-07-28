# Blog Management System - Frontend

A modern, responsive Next.js frontend for the blog management system with admin panel and public website.

## Features

- **Public Blog Website**: Beautiful, responsive blog with search and filtering
- **Admin Panel**: Secure admin interface for content management
- **Rich Text Editor**: TipTap-based editor with image and video support
- **File Management**: Upload and manage downloadable files
- **Download Requests**: Approval workflow for file downloads
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient data fetching and caching
- **Form Validation**: Comprehensive form validation with react-hook-form

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Forms**: React Hook Form
- **Rich Text Editor**: TipTap
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see Backend README)

## Installation

1. **Navigate to frontend directory**

   ```bash
   cd Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
Frontend/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   │   ├── login/         # Admin login
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── posts/         # Post management
│   │   ├── categories/    # Category management
│   │   ├── tags/          # Tag management
│   │   ├── files/         # File management
│   │   └── requests/      # Download requests
│   ├── posts/             # Public blog post pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   ├── editor/           # Rich text editor
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── api.ts           # API client
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── styles/              # Additional styles
```

## Pages Overview

### Public Website

- **Home Page** (`/`): Blog listing with search and filters
- **Post Detail** (`/posts/[slug]`): Individual blog post view
- **Category Pages** (`/category/[slug]`): Posts filtered by category
- **Tag Pages** (`/tag/[slug]`): Posts filtered by tag

### Admin Panel

- **Login** (`/admin/login`): Admin authentication
- **Dashboard** (`/admin/dashboard`): Overview and statistics
- **Posts** (`/admin/posts`): Create, edit, and manage posts
- **Categories** (`/admin/categories`): Manage blog categories
- **Tags** (`/admin/tags`): Manage blog tags
- **Files** (`/admin/files`): Upload and manage files
- **Requests** (`/admin/requests`): Manage download requests

## Components

### UI Components

- **Button**: Versatile button component with variants
- **Input**: Form input with validation support
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection component
- **Card**: Content container component
- **Badge**: Status and label indicators
- **Modal**: Overlay dialog component

### Form Components

- **LoginForm**: Admin authentication form
- **PostForm**: Blog post creation/editing form
- **CategoryForm**: Category management form
- **TagForm**: Tag management form
- **FileUpload**: File upload component
- **DownloadRequestForm**: File download request form

### Editor Components

- **RichTextEditor**: TipTap-based rich text editor
- **EditorToolbar**: Editor formatting toolbar
- **ImageUpload**: Image upload for editor
- **VideoEmbed**: Video embedding component

## API Integration

The frontend communicates with the backend through a centralized API client (`lib/api.ts`) that provides:

- **Authentication**: Login, logout, profile management
- **Posts**: CRUD operations for blog posts
- **Categories**: Category management
- **Tags**: Tag management
- **Files**: File upload and management
- **Download Requests**: Request approval workflow

## Styling

The application uses Tailwind CSS with a custom design system:

- **Colors**: Primary, secondary, success, warning, error variants
- **Typography**: Custom font stack with Inter
- **Components**: Pre-built component classes
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth transitions and loading states

## State Management

- **React Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Local Storage**: Authentication tokens and user data
- **Context**: Global application state (if needed)

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **Husky**: Git hooks (if configured)

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure your hosting platform accordingly

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Caching**: React Query caching strategies
- **Bundle Analysis**: Built-in bundle analyzer

## Security

- **Authentication**: JWT token-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Token-based CSRF protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
