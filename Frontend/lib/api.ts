import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Post, 
  Category, 
  Tag, 
  File, 
  DownloadRequest,
  ApiResponse, 
  PaginatedResponse,
  PostQueryParams,
  FileQueryParams,
  DownloadRequestQueryParams,
  LoginForm,
  PostForm,
  CategoryForm,
  TagForm,
  FileForm,
  DownloadRequestForm
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async changePassword(data: { current_password: string; new_password: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.post('/auth/change-password', data);
    return response.data;
  }

  // Posts endpoints
  async getPosts(params?: PostQueryParams): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const response = await this.client.get('/posts', { params });
    return response.data;
  }

  async getPost(slug: string): Promise<ApiResponse<Post>> {
    const response = await this.client.get(`/posts/${slug}`);
    return response.data;
  }

  async createPost(data: PostForm): Promise<ApiResponse<Post>> {
    const response = await this.client.post('/posts', data);
    return response.data;
  }

  async updatePost(id: number, data: Partial<PostForm>): Promise<ApiResponse<Post>> {
    const response = await this.client.put(`/posts/${id}`, data);
    return response.data;
  }

  async deletePost(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.delete(`/posts/${id}`);
    return response.data;
  }

  async getRelatedPosts(postId: number, limit: number = 3): Promise<ApiResponse<Post[]>> {
    const response = await this.client.get(`/posts/${postId}/related`, { params: { limit } });
    return response.data;
  }

  // Categories endpoints
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async getCategory(slug: string): Promise<ApiResponse<Category>> {
    const response = await this.client.get(`/categories/${slug}`);
    return response.data;
  }

  async createCategory(data: CategoryForm): Promise<ApiResponse<Category>> {
    const response = await this.client.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<CategoryForm>): Promise<ApiResponse<Category>> {
    const response = await this.client.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.delete(`/categories/${id}`);
    return response.data;
  }

  // Tags endpoints
  async getTags(): Promise<ApiResponse<Tag[]>> {
    const response = await this.client.get('/tags');
    return response.data;
  }

  async getTag(slug: string): Promise<ApiResponse<Tag>> {
    const response = await this.client.get(`/tags/${slug}`);
    return response.data;
  }

  async createTag(data: TagForm): Promise<ApiResponse<Tag>> {
    const response = await this.client.post('/tags', data);
    return response.data;
  }

  async updateTag(id: number, data: Partial<TagForm>): Promise<ApiResponse<Tag>> {
    const response = await this.client.put(`/tags/${id}`, data);
    return response.data;
  }

  async deleteTag(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.delete(`/tags/${id}`);
    return response.data;
  }

  // Files endpoints
  async getFiles(params?: FileQueryParams): Promise<ApiResponse<PaginatedResponse<File>>> {
    const response = await this.client.get('/files', { params });
    return response.data;
  }

  async getFile(id: number): Promise<ApiResponse<File>> {
    const response = await this.client.get(`/files/${id}`);
    return response.data;
  }

  async uploadFile(file: File, data?: Partial<FileForm>): Promise<ApiResponse<File>> {
    const formData = new FormData();
    formData.append('file', file);
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key as keyof FileForm] as string);
      });
    }
    
    const response = await this.client.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateFile(id: number, data: Partial<FileForm>): Promise<ApiResponse<File>> {
    const response = await this.client.put(`/files/${id}`, data);
    return response.data;
  }

  async deleteFile(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.delete(`/files/${id}`);
    return response.data;
  }

  async downloadFile(id: number): Promise<Blob> {
    const response = await this.client.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Download requests endpoints
  async getDownloadRequests(params?: DownloadRequestQueryParams): Promise<ApiResponse<PaginatedResponse<DownloadRequest>>> {
    const response = await this.client.get('/download-requests', { params });
    return response.data;
  }

  async getDownloadRequest(id: number): Promise<ApiResponse<DownloadRequest>> {
    const response = await this.client.get(`/download-requests/${id}`);
    return response.data;
  }

  async createDownloadRequest(data: DownloadRequestForm & { file_id: number }): Promise<ApiResponse<DownloadRequest>> {
    const response = await this.client.post('/download-requests', data);
    return response.data;
  }

  async updateDownloadRequest(id: number, data: { status: 'approved' | 'denied'; admin_notes?: string }): Promise<ApiResponse<DownloadRequest>> {
    const response = await this.client.put(`/download-requests/${id}`, data);
    return response.data;
  }

  async deleteDownloadRequest(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await this.client.delete(`/download-requests/${id}`);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalCategories: number;
    totalTags: number;
    totalFiles: number;
    pendingRequests: number;
    totalUsers: number;
  }>> {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }

  // Search endpoints
  async searchPosts(query: string, params?: Omit<PostQueryParams, 'search'>): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const response = await this.client.get('/search/posts', { 
      params: { ...params, q: query } 
    });
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient; 