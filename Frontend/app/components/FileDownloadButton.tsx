'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BlogFile, User } from '@/types'
import apiClient from '@/lib/api'
import { storage } from '@/lib/storage'
import { Download, Lock, Clock } from 'lucide-react'

interface FileDownloadButtonProps {
  file: BlogFile
  user: User | null
  postId: number
}

export default function FileDownloadButton({ file, user, postId }: FileDownloadButtonProps) {
  const router = useRouter()
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownloadClick = async () => {
    if (!user) {
      router.push(`/login?returnUrl=/post/${postId}`)
      return
    }

    try {
      // Try to download the file directly first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/download`, {
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
        return
      }

      // If unauthorized but needs a request
      const data = await response.json()
      if (response.status === 403 && data.needsRequest) {
        // Submit a download request
        setRequesting(true)
        const result = await apiClient.createDownloadRequest({
          file_id: file.id
        })
        
        setRequested(true)
        setRequesting(false)
      } else {
        setError('Unable to download file. Please try again later.')
      }
    } catch (error) {
      setError('Unable to download file. Please try again later.')
      setRequesting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        <span className="font-medium">{file.original_name}</span>
        <span className="text-xs text-gray-500">
          ({(file.file_size / 1024).toFixed(1)} KB)
        </span>
      </div>
      
      {requested ? (
        <div className="flex items-center mt-2 text-sm text-amber-600">
          <Clock className="h-4 w-4 mr-1" />
          Request submitted. Download will be available after approval.
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 mt-2">{error}</div>
      ) : (
        <button
          onClick={handleDownloadClick}
          disabled={requesting}
          className="flex items-center mt-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm transition-colors disabled:opacity-50"
        >
          {requesting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : user ? (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download File
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
  )
}