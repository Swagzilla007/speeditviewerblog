import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Post, 
  PostDetail, 
  Category, 
  Tag, 
  File, 
  DownloadRequest,
  PostsQueryParams,
  FilesQueryParams,
  DownloadRequestsQueryParams,
  LoginForm,
  PostForm,
  CategoryForm,
  TagForm,
  DownloadRequestForm,
  ApiResponse,
  PaginatedResponse
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string; message: string }> = 
      await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<{ user: User }> = await this.client.get('/auth/profile');
    return response.data.user;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.client.put('/auth/change-password', data);
  }

  // Posts endpoints
  async getPosts(params?: PostsQueryParams): Promise<PaginatedResponse<Post>> {
    const response: AxiosResponse<{ posts: Post[]; pagination: any }> = 
      await this.client.get('/posts', { params });
    return {
      data: response.data.posts,
      pagination: response.data.pagination,
    };
  }

  async getPost(slug: string): Promise<{ post: PostDetail; relatedPosts: Post[] }> {
    const response: AxiosResponse<{ post: PostDetail; relatedPosts: Post[] }> = 
      await this.client.get(`/posts/${slug}`);
    return response.data;
  }

  async createPost(data: PostForm): Promise<Post> {
    const response: AxiosResponse<{ post: Post; message: string }> = 
      await this.client.post('/posts', data);
    return response.data.post;
  }

  async updatePost(id: number, data: Partial<PostForm>): Promise<Post> {
    const response: AxiosResponse<{ post: Post; message: string }> = 
      await this.client.put(`/posts/${id}`, data);
    return response.data.post;
  }

  async deletePost(id: number): Promise<void> {
    await this.client.delete(`/posts/${id}`);
  }

  // Categories endpoints
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<{ categories: Category[] }> = 
      await this.client.get('/categories');
    return response.data.categories;
  }

  async getCategory(slug: string): Promise<Category> {
    const response: AxiosResponse<{ category: Category }> = 
      await this.client.get(`/categories/${slug}`);
    return response.data.category;
  }

  async createCategory(data: CategoryForm): Promise<Category> {
    const response: AxiosResponse<{ category: Category; message: string }> = 
      await this.client.post('/categories', data);
    return response.data.category;
  }

  async updateCategory(id: number, data: CategoryForm): Promise<Category> {
    const response: AxiosResponse<{ category: Category; message: string }> = 
      await this.client.put(`/categories/${id}`, data);
    return response.data.category;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.client.delete(`/categories/${id}`);
  }

  // Tags endpoints
  async getTags(): Promise<Tag[]> {
    const response: AxiosResponse<{ tags: Tag[] }> = 
      await this.client.get('/tags');
    return response.data.tags;
  }

  async getTag(slug: string): Promise<Tag> {
    const response: AxiosResponse<{ tag: Tag }> = 
      await this.client.get(`/tags/${slug}`);
    return response.data.tag;
  }

  async createTag(data: TagForm): Promise<Tag> {
    const response: AxiosResponse<{ tag: Tag; message: string }> = 
      await this.client.post('/tags', data);
    return response.data.tag;
  }

  async updateTag(id: number, data: TagForm): Promise<Tag> {
    const response: AxiosResponse<{ tag: Tag; message: string }> = 
      await this.client.put(`/tags/${id}`, data);
    return response.data.tag;
  }

  async deleteTag(id: number): Promise<void> {
    await this.client.delete(`/tags/${id}`);
  }

  // Files endpoints
  async uploadFile(file: File, postId?: number): Promise<File> {
    const formData = new FormData();
    formData.append('file', file);
    if (postId) {
      formData.append('postId', postId.toString());
    }

    const response: AxiosResponse<{ file: File; message: string }> = 
      await this.client.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data.file;
  }

  async getFiles(params?: FilesQueryParams): Promise<PaginatedResponse<File>> {
    const response: AxiosResponse<{ files: File[]; pagination: any }> = 
      await this.client.get('/files', { params });
    return {
      data: response.data.files,
      pagination: response.data.pagination,
    };
  }

  async getFile(id: number): Promise<File> {
    const response: AxiosResponse<{ file: File }> = 
      await this.client.get(`/files/${id}`);
    return response.data.file;
  }

  async downloadFile(id: number): Promise<Blob> {
    const response = await this.client.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async updateFile(id: number, data: { postId?: number }): Promise<File> {
    const response: AxiosResponse<{ file: File; message: string }> = 
      await this.client.put(`/files/${id}`, data);
    return response.data.file;
  }

  async deleteFile(id: number): Promise<void> {
    await this.client.delete(`/files/${id}`);
  }

  // Download Requests endpoints
  async createDownloadRequest(data: DownloadRequestForm): Promise<DownloadRequest> {
    const response: AxiosResponse<{ request: DownloadRequest; message: string }> = 
      await this.client.post('/download-requests', data);
    return response.data.request;
  }

  async getMyRequests(params?: DownloadRequestsQueryParams): Promise<PaginatedResponse<DownloadRequest>> {
    const response: AxiosResponse<{ requests: DownloadRequest[]; pagination: any }> = 
      await this.client.get('/download-requests/my-requests', { params });
    return {
      data: response.data.requests,
      pagination: response.data.pagination,
    };
  }

  async getAllRequests(params?: DownloadRequestsQueryParams): Promise<PaginatedResponse<DownloadRequest>> {
    const response: AxiosResponse<{ requests: DownloadRequest[]; pagination: any }> = 
      await this.client.get('/download-requests', { params });
    return {
      data: response.data.requests,
      pagination: response.data.pagination,
    };
  }

  async getRequest(id: number): Promise<DownloadRequest> {
    const response: AxiosResponse<{ request: DownloadRequest }> = 
      await this.client.get(`/download-requests/${id}`);
    return response.data.request;
  }

  async updateRequest(id: number, data: { status: 'pending' | 'approved' | 'rejected'; notes?: string }): Promise<DownloadRequest> {
    const response: AxiosResponse<{ request: DownloadRequest; message: string }> = 
      await this.client.put(`/download-requests/${id}`, data);
    return response.data.request;
  }

  async deleteRequest(id: number): Promise<void> {
    await this.client.delete(`/download-requests/${id}`);
  }
}

export const api = new ApiClient(); 