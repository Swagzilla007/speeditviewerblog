'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { 
  FileText, 
  FolderOpen, 
  Tag, 
  Download, 
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [postsRes, categoriesRes, tagsRes, filesRes, requestsRes] = await Promise.all([
        apiClient.getPosts({ limit: 1 }),
        apiClient.getCategories(),
        apiClient.getTags(),
        apiClient.getFiles(),
        apiClient.getDownloadRequests()
      ])
      
      return {
        posts: postsRes.data.pagination.total,
        categories: categoriesRes.data.length,
        tags: tagsRes.data.length,
        files: filesRes.data.pagination.total,
        requests: requestsRes.data.pagination.total,
        pendingRequests: requestsRes.data.data.filter((r: any) => r.status === 'pending').length
      }
    }
  })

  const { data: recentPosts } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: async () => {
      const response = await apiClient.getPosts({ limit: 5 })
      return response.data.data
    }
  })

  const { data: recentRequests } = useQuery({
    queryKey: ['recent-requests'],
    queryFn: async () => {
      const response = await apiClient.getDownloadRequests({ limit: 5 })
      return response.data.data
    }
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your blog management dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.posts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.categories || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tags</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.tags || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Download className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Files</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.files || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/posts/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Create New Post</p>
                <p className="text-sm text-gray-600">Write a new blog post</p>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <FolderOpen className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Categories</p>
                <p className="text-sm text-gray-600">Organize your content</p>
              </div>
            </Link>

            <Link
              href="/admin/requests"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <Download className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Download Requests</p>
                <p className="text-sm text-gray-600">{stats?.pendingRequests || 0} pending</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Posts</h2>
              <Link
                href="/admin/posts"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : post.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status === 'published' && <Eye className="h-3 w-3 mr-1" />}
                          {post.status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                          {post.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                          {post.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No posts yet</p>
            )}
          </div>
        </div>

        {/* Recent Download Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Download Requests</h2>
              <Link
                href="/admin/requests"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentRequests && recentRequests.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.file?.name || 'Unknown file'}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {request.status === 'denied' && <XCircle className="h-3 w-3 mr-1" />}
                          {request.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/requests/${request.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No download requests yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 