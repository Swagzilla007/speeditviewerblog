'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  FileText,
  Image,
  File,
  Eye,
  EyeOff,
  Filter,
  Code,
  Database,
  Terminal,
  FileCode
} from 'lucide-react'

export default function FilesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [publicFilter, setPublicFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingFile, setEditingFile] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    is_public: true
  })

  // Always filter to show only attached files (not featured images)
  const { data: filesData, isLoading } = useQuery({
    queryKey: ['files', { 
      search: searchQuery, 
      is_public: publicFilter, 
      page: currentPage,
      fileType: 'attached'  // Always filter for attached files
    }],
    queryFn: () => apiClient.getFiles({
      search: searchQuery || undefined,
      is_public: publicFilter === '' ? undefined : publicFilter === 'true',
      page: currentPage,
      limit: 10,
      // Only show attached files (not featured images)
      fileType: 'attached'
    })
  })

  // Removed standalone file upload functionality as files should be uploaded through posts

  const updateFileMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.updateFile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      setEditingFile(null)
      setFormData({ description: '', is_public: true })
    }
  })

  const deleteFileMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    }
  })

  // Removed handleFileUpload as files should be uploaded through posts

  const handleEdit = (file: any) => {
    setEditingFile(file)
    setFormData({
      description: file.description || '',
      is_public: file.is_public
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingFile) {
      await updateFileMutation.mutateAsync({ id: editingFile.id, data: formData })
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFileMutation.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting file:', error)
      }
    }
  }

  const handleDownload = async (id: number) => {
    try {
      const blob = await apiClient.downloadFile(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = ''
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleCancel = () => {
    setEditingFile(null)
    setFormData({ description: '', is_public: true })
    setShowForm(false)
  }

  const getFileIcon = (mimeType: string, fileName?: string) => {
    // Determine file extension from fileName if available
    const ext = fileName ? fileName.split('.').pop()?.toLowerCase() : '';

    // Image files
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-600" />
    }
    
    // Programming files by extension
    if (ext) {
      // Web development
      if (['html', 'htm'].includes(ext)) {
        return <Code className="h-5 w-5 text-orange-500" />
      }
      if (['css'].includes(ext)) {
        return <Code className="h-5 w-5 text-blue-500" />
      }
      if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
        return <Code className="h-5 w-5 text-yellow-500" />
      }
      
      // Data formats
      if (['json', 'xml', 'yml', 'yaml'].includes(ext)) {
        return <Code className="h-5 w-5 text-green-500" />
      }
      
      // Backend/programming languages
      if (['sql'].includes(ext)) {
        return <Database className="h-5 w-5 text-blue-700" />
      }
      if (['java', 'py', 'rb', 'php', 'c', 'cpp', 'cs', 'go'].includes(ext)) {
        return <Code className="h-5 w-5 text-purple-600" />
      }
      
      // Scripts
      if (['sh', 'bat', 'ps1'].includes(ext)) {
        return <Terminal className="h-5 w-5 text-gray-800" />
      }
    }
    
    // Text-based code files by MIME type
    if (mimeType.startsWith('text/') || 
        mimeType.includes('javascript') || 
        mimeType.includes('json') || 
        mimeType.includes('xml')) {
      return <FileText className="h-5 w-5 text-indigo-600" />
    }
    
    // Default file icon
    return <File className="h-5 w-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const files = filesData?.files || []
  const pagination = filesData?.pagination || { total: 0, totalPages: 0, page: 1, from: 0, to: 0 }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Files</h1>
            <p className="text-gray-600">Manage downloadable files uploaded to your blog</p>
            <div className="mt-2 text-sm text-gray-500">
              <p>This page displays attached files for download by your visitors.</p>
              <p className="mt-1">Files can only be uploaded through posts when creating or editing content.</p>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
              <FileText className="h-4 w-4 mr-2" />
              Documents, PDFs, Archives
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <FileCode className="h-4 w-4 mr-2" />
              Programming Files: SQL, HTML, Java, JavaScript, etc.
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex">
              <select
                value={publicFilter}
                onChange={(e) => setPublicFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              >
                <option value="">All Visibility</option>
                <option value="true">Public Files</option>
                <option value="false">Private Files</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {pagination.total || 0} files
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* File Edit Form */}
      {showForm && editingFile && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Edit File: {editingFile.original_name}
            </h2>
            
            {/* File information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">File Type</p>
                  <p className="font-medium">
                    {(() => {
                      // Get file extension
                      const ext = editingFile.original_name ? 
                                  editingFile.original_name.split('.').pop()?.toLowerCase() : '';
                      
                      // Programming files
                      if (['html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx'].includes(ext || '')) {
                        return 'Web Programming File';
                      } else if (['json', 'xml', 'yml', 'yaml'].includes(ext || '')) {
                        return 'Data Format File';
                      } else if (['sql'].includes(ext || '')) {
                        return 'SQL Database File';
                      } else if (['java', 'py', 'rb', 'php', 'c', 'cpp', 'cs', 'go'].includes(ext || '')) {
                        return 'Programming Source File';
                      } else if (['sh', 'bat', 'ps1'].includes(ext || '')) {
                        return 'Script File';
                      } else if (editingFile.mime_type.startsWith('image/')) {
                        return 'Image File';
                      } else if (editingFile.mime_type.includes('pdf')) {
                        return 'PDF Document';
                      } else if (editingFile.mime_type.includes('word') || 
                                editingFile.mime_type.includes('document')) {
                        return 'Word Document';
                      } else if (editingFile.mime_type.includes('excel') || 
                                editingFile.mime_type.includes('sheet')) {
                        return 'Spreadsheet';
                      } else if (editingFile.mime_type.startsWith('text/')) {
                        return 'Text Document';
                      }
                      
                      // Default
                      return 'Document';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-medium">{formatFileSize(editingFile.file_size)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Downloads</p>
                  <p className="font-medium">{editingFile.download_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Upload Date</p>
                  <p className="font-medium">{new Date(editingFile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Associated post information */}
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-500">Associated Post</p>
                {editingFile.post_title ? (
                  <div className="mt-2">
                    <a 
                      href={`/admin/posts/${editingFile.post_id}/edit`}
                      className="inline-flex items-center text-blue-600 hover:underline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {editingFile.post_title}
                    </a>
                  </div>
                ) : (
                  <p className="italic text-gray-500">No associated post</p>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter file description..."
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Public file</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.is_public 
                    ? 'Public files can be downloaded by anyone without approval' 
                    : 'Private files require approval for each download request'}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={updateFileMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {updateFileMutation.isPending ? 'Saving...' : 'Update File'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Associated Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file: any) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                              {getFileIcon(file.mime_type, file.original_name)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {file.original_name}
                              </span>
                            </div>
                            {file.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {file.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {file.post_title ? (
                          <a 
                            href={`/admin/posts/${file.post_id}/edit`}
                            className="text-blue-600 hover:text-blue-900 hover:underline flex items-center"
                            title="Edit associated post"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {file.post_title}
                          </a>
                        ) : (
                          <span className="text-gray-500 italic">No post</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Download className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {file.download_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          file.is_public 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {file.is_public ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Private
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDownload(file.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(file)}
                            className="text-primary-600 hover:text-primary-900 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 