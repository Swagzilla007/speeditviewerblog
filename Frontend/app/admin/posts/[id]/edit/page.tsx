'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import apiClient from '@/lib/api'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Clock, 
  Calendar,
  Upload,
  X,
  FileText,
  FolderOpen,
  Tag
} from 'lucide-react'
import Link from 'next/link'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    scheduled_at: '',
    category_ids: [] as number[],
    tag_ids: [] as number[]
  })
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => apiClient.getPostById(postId),
    enabled: !!postId
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories()
  })

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags()
  })

  const updatePostMutation = useMutation({
    mutationFn: (data: any) => apiClient.updatePost(parseInt(postId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      router.push('/admin/posts')
    }
  })

  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => apiClient.uploadFile(file),
    onSuccess: (data) => {
      setUploadedFiles(prev => [...prev, data.data])
    }
  })

  // Initialize form data when post is loaded
  useEffect(() => {
    if (post?.post) {
      const postData = post.post
      setFormData({
        title: postData.title || '',
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        featured_image: postData.featured_image || '',
        status: postData.status || 'draft',
        scheduled_at: postData.scheduled_at ? new Date(postData.scheduled_at).toISOString().slice(0, 16) : '',
        category_ids: postData.categories?.map((c: any) => c.id) || [],
        tag_ids: postData.tags?.map((t: any) => t.id) || []
      })
      setUploadedFiles(postData.files || [])
    }
  }, [post])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const postData = {
      ...formData,
      categories: formData.category_ids,
      tags: formData.tag_ids,
      file_ids: uploadedFiles.map(f => f.id)
    }

    try {
      await updatePostMutation.mutateAsync(postData)
    } catch (error) {
      console.error('Error updating post:', error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        uploadFileMutation.mutate(file)
      })
    }
  }

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleCategoryChange = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }))
  }

  const handleTagChange = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }))
  }

  if (postLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post?.post) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Post not found</h3>
        <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
        <Link
          href="/admin/posts"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/posts"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
              <p className="text-gray-600">Update your blog post</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={updatePostMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter post title..."
                required
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter post excerpt..."
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Write your post content..."
                required
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featured_image}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attached Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload additional files to attach to this post
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>
              
              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.original_name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="mr-2"
                  />
                  <Clock className="h-4 w-4 text-gray-600 mr-2" />
                  Draft
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="mr-2"
                  />
                  <Eye className="h-4 w-4 text-green-600 mr-2" />
                  Published
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={formData.status === 'scheduled'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="mr-2"
                  />
                  <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                  Scheduled
                </label>
              </div>
              
              {formData.status === 'scheduled' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories?.categories?.map((category: any) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="mr-2"
                    />
                    <FolderOpen className="h-4 w-4 text-gray-400 mr-2" />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tags?.tags?.map((tag: any) => (
                  <label key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tag_ids.includes(tag.id)}
                      onChange={() => handleTagChange(tag.id)}
                      className="mr-2"
                    />
                    <Tag className="h-4 w-4 text-gray-400 mr-2" />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
} 