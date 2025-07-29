'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import { useState, useEffect } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on 429 errors
          if (error?.response?.status === 429) {
            return false
          }
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry on 429 errors
          if (error?.response?.status === 429) {
            return false
          }
          return failureCount < 1
        },
      },
    },
  }))

  // Listen for rate limiting errors
  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      if (event.detail.type === 'error') {
        toast.error(event.detail.message)
      }
    }

    window.addEventListener('show-toast', handleShowToast as EventListener)
    
    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
} 