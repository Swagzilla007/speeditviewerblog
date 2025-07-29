// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// Post Types
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  scheduled_at?: string;
  author_id: number;
  author: User;
  categories: Category[];
  tags: Tag[];
  files: BlogFile[];
  created_at: string;
  updated_at: string;
}

// File Types
export interface BlogFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  description?: string;
  post_id?: number;
  download_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Download Request Types
export interface DownloadRequest {
  id: number;
  user_id: number;
  file_id: number;
  status: 'pending' | 'approved' | 'denied';
  request_reason?: string;
  admin_notes?: string;
  user: User;
  file: BlogFile;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface PostForm {
  title: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at?: string;
  category_ids: number[];
  tag_ids: number[];
}

export interface CategoryForm {
  name: string;
  description?: string;
}

export interface TagForm {
  name: string;
}

export interface FileForm {
  description?: string;
  is_public: boolean;
}

export interface DownloadRequestForm {
  request_reason?: string;
}

// Query Parameters
export interface PostQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  status?: string;
  author?: string;
}

export interface FileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  post_id?: number;
  is_public?: boolean;
}

export interface DownloadRequestQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  user_id?: number;
  file_id?: number;
}

// Component Props
export interface PostCardProps {
  post: Post;
  showAuthor?: boolean;
  showExcerpt?: boolean;
}

export interface PostListProps {
  posts: Post[];
  loading?: boolean;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export interface SearchFiltersProps {
  categories: Category[];
  tags: Tag[];
  selectedCategory?: string;
  selectedTag?: string;
  searchQuery?: string;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export interface FileUploadProps {
  onFileUpload: (file: BlogFile) => void;
  onFileRemove: (fileId: number) => void;
  files: BlogFile[];
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
}

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// Dashboard Types
export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
  totalFiles: number;
  pendingRequests: number;
  totalUsers: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Theme Types
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// App Configuration
export interface AppConfig {
  name: string;
  description: string;
  version: string;
  apiUrl: string;
  uploadUrl: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
} 