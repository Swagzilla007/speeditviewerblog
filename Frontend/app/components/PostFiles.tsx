'use client'

import { useState, useEffect } from 'react'
import { BlogFile, User } from '@/types'
import { useRouter } from 'next/navigation'
import { FileText, Download, Lock } from 'lucide-react'
import apiClient from '@/lib/api'
import { storage } from '@/lib/storage'

interface PostFilesProps {
  files: BlogFile[]
  postId: number
}

export default function PostFiles({ files, postId }: PostFilesProps) {
  const [user, setUser] = useState<User | null>(null)
  const [fileStates, setFileStates] = useState<Record<number, { 
    isRequesting: boolean, 
    requested: boolean, 
    error: string | null,
    approved: boolean,
    rejected?: boolean,
    loading?: boolean
  }>>({})
  const router = useRouter()

  useEffect(() => {
    // Initialize file states
    const initialFileStates: Record<number, any> = {}
    files.forEach(file => {
      initialFileStates[file.id] = {
        isRequesting: false,
        requested: false,
        error: null,
        approved: false,
        loading: true
      }
    })
    setFileStates(initialFileStates)
    
    // Get user from storage
    const storedUser = storage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        
        // For each file, check if the user has already requested it
        files.forEach(async (file) => {
          try {
            const requestStatus = await apiClient.checkDownloadRequest(file.id)
            setFileStates(prev => ({
              ...prev,
              [file.id]: {
                ...prev[file.id],
                requested: requestStatus.requested,
                approved: requestStatus.status === 'approved',
                rejected: requestStatus.status === 'rejected',
                loading: false
              }
            }))
          } catch (error) {
            console.error(`Failed to check request status for file ${file.id}`, error)
            setFileStates(prev => ({
              ...prev,
              [file.id]: {
                ...prev[file.id],
                loading: false
              }
            }))
          }
        })
      } catch (e) {
        console.error('Failed to parse user from localStorage')
      }
    } else {
      // If no user, mark all files as not loading
      const notLoadingStates = {...initialFileStates}
      Object.keys(notLoadingStates).forEach(id => {
        notLoadingStates[Number(id)].loading = false
      })
      setFileStates(notLoadingStates)
    }
  }, [files])

  const handleDownloadClick = async (file: BlogFile) => {
    if (!user) {
      router.push(`/login?returnUrl=/post/${postId}`)
      return
    }

    try {
      // Update local state to show loading
      setFileStates(prev => ({
        ...prev,
        [file.id]: {
          ...prev[file.id],
          isRequesting: true,
          error: null
        }
      }))

      // Try to download the file directly first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/files/${file.id}/download`, {
        headers: {
          'Authorization': `Bearer ${storage.getItem('auth_token')}`
        }
      })

      // If the response is successful, create a download link
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = file.original_name
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)

        setFileStates(prev => ({
          ...prev,
          [file.id]: {
            ...prev[file.id],
            isRequesting: false,
            approved: true
          }
        }))
        
        return
      }

      // If unauthorized but needs a request
      const data = await response.json()
      if (response.status === 403 && data.needsRequest) {
        // Submit a download request
        const result = await apiClient.createDownloadRequest({
          file_id: file.id
        })
        
        setFileStates(prev => ({
          ...prev,
          [file.id]: {
            ...prev[file.id],
            isRequesting: false,
            requested: true
          }
        }))
      } else {
        setFileStates(prev => ({
          ...prev,
          [file.id]: {
            ...prev[file.id],
            isRequesting: false,
            error: data.error || 'Unable to download file'
          }
        }))
      }
    } catch (error: any) {
      setFileStates(prev => ({
        ...prev,
        [file.id]: {
          ...prev[file.id],
          isRequesting: false,
          error: error.message || 'Unable to download file'
        }
      }))
    }
  }

  if (!files || files.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Downloadable Files</h3>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {files.map((file) => {
            const fileState = fileStates[file.id] || { 
              isRequesting: false, 
              requested: false, 
              error: null,
              approved: false,
              rejected: false,
              loading: false
            }
            
            return (
              <li key={file.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-center mb-2 sm:mb-0">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{file.original_name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div>
                  {fileState.loading ? (
                    <div className="flex items-center text-sm text-gray-500 px-3 py-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  ) : fileState.approved ? (
                    <button
                      onClick={() => handleDownloadClick(file)}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Now
                    </button>
                  ) : fileState.requested ? (
                    <div className="text-sm bg-amber-50 text-amber-700 px-3 py-2 rounded-md">
                      <p>Download requested. Waiting for approval.</p>
                    </div>
                  ) : fileState.rejected ? (
                    <div className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-md">
                      <p>Download request rejected.</p>
                      <button 
                        onClick={() => handleDownloadClick(file)}
                        className="text-primary-600 hover:text-primary-800 underline mt-1"
                      >
                        Request Again
                      </button>
                    </div>
                  ) : fileState.error ? (
                    <div className="text-sm text-red-600">{fileState.error}</div>
                  ) : (
                    <button
                      onClick={() => handleDownloadClick(file)}
                      disabled={fileState.isRequesting}
                      className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm disabled:opacity-50"
                    >
                      {fileState.isRequesting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : user ? (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Request Download
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Login to Download
                        </>
                      )}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  )
}