'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { 
  Search, 
  Filter, 
  CheckCircle,
  XCircle,
  FileText,
  User,
  Clock,
  CalendarDays
} from 'lucide-react'

export default function DownloadRequestsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['downloadRequests', { status: statusFilter, page: currentPage }],
    queryFn: () => apiClient.getDownloadRequests({
      status: statusFilter || undefined,
      page: currentPage,
      limit: 10
    }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status, admin_notes }: { id: number; status: 'approved' | 'rejected'; admin_notes?: string }) => {
      return apiClient.updateDownloadRequest(id, { status, admin_notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadRequests'] })
    }
  })

  const approveRequest = (id: number) => {
    updateRequestMutation.mutate({ id, status: 'approved' })
  }

  const rejectRequest = (id: number) => {
    updateRequestMutation.mutate({ id, status: 'rejected' })
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Download Requests</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage user download requests for restricted files.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-4">
            <div className="w-full sm:w-auto flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <select
                className="block w-full sm:text-sm rounded-md border-gray-300"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-gray-400 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Loading download requests...</p>
          </div>
        ) : requestsData?.requests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">No download requests found.</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {requestsData?.requests.map((request) => (
              <li key={request.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {request.file_name}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex items-center text-sm text-gray-500 mr-4">
                        <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>Requested by: {request.requester_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{new Date(request.request_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {request.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Request note:</span> {request.notes}
                        </p>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <CalendarDays className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>
                            {request.status === 'approved' ? 'Approved' : 'Rejected'} on {request.approved_date ? new Date(request.approved_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        {request.approver_name && (
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>By: {request.approver_name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-3">
                    {/* Always show both buttons, but highlight the active status */}
                    <button
                      type="button"
                      onClick={() => approveRequest(request.id)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        request.status === 'approved'
                          ? 'bg-green-200 text-green-800 border-green-500'
                          : 'text-white bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> {request.status === 'approved' ? 'Approved' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectRequest(request.id)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                        request.status === 'rejected'
                          ? 'bg-red-200 text-red-800 border-red-500'
                          : 'text-white bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> {request.status === 'rejected' ? 'Rejected' : 'Reject'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {requestsData?.pagination && requestsData.pagination.totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === requestsData.pagination.totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === requestsData.pagination.totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, requestsData.pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{requestsData.pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Page numbers */}
                  {[...Array(requestsData.pagination.totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === idx + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === requestsData.pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === requestsData.pagination.totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}