# Blog Management System - Frontend

A modern blog management system built with Next.js 14, TypeScript, and Tailwind CSS. This frontend application provides both an admin panel for content management and a user-facing blog interface.

## Features

### Admin Panel

- **Authentication**: Secure admin login with JWT tokens
- **Dashboard**: Overview of posts, categories, tags, files, and download requests
- **Posts Management**:
  - Create, edit, and delete blog posts
  - Rich text editor for content
  - Post status management (draft, published, scheduled)
  - Category and tag assignment
  - File attachments
  - Featured image support
- **Categories Management**: Create, edit, and delete categories
- **Tags Management**: Create, edit, and delete tags
- **Files Management**:
  - Upload and manage files
  - File visibility settings (public/private)
  - Download tracking
  - File metadata editing
- **Download Requests**: (Coming soon) Manage user download requests for private files

### User Interface (Coming Soon)

- Public blog viewing
- Post search and filtering
- Category and tag browsing
- File download requests
- Responsive design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Rich Text Editor**: TipTap (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see Backend README)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd speeditviewerblog/Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your backend API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Panel Access

1. Navigate to `/admin/login`
2. Use the admin credentials from your backend setup
3. Access the admin panel at `/admin`

## Project Structure

```
Frontend/
├── app/
│   ├── admin/                 # Admin panel pages
│   │   ├── layout.tsx        # Admin layout with sidebar
│   │   ├── page.tsx          # Dashboard
│   │   ├── login/            # Admin login
│   │   ├── posts/            # Posts management
│   │   ├── categories/       # Categories management
│   │   ├── tags/             # Tags management
│   │   └── files/            # Files management
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── providers.tsx         # React Query provider
├── lib/
│   ├── api.ts               # API client
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript type definitions
└── public/                  # Static assets
```

## API Integration

The frontend communicates with the backend through the API client in `lib/api.ts`. All API calls are handled with proper error handling and authentication.

### Key API Features:

- JWT token management
- Automatic token refresh
- Request/response interceptors
- Error handling with automatic redirects

## Styling

The application uses Tailwind CSS with a custom color palette:

- **Primary**: Blue (#1e88e5)
- **Secondary**: Orange (#ff9800)
- **Accent**: Yellow (#ffc107)
- **Dark**: Dark blue (#1a1a2e)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## Deployment

The application can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Self-hosted

### Environment Variables for Production

Make sure to set the following environment variables in your production environment:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
