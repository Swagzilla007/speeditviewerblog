'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { Post, Category, Tag } from '@/types'
import { formatDate, truncateText, cn } from '@/lib/utils'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Tag as TagIcon, 
  Eye, 
  FileText,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch posts
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['posts', { search: searchQuery, category: selectedCategory, tag: selectedTag, page: currentPage }],
    queryFn: () => apiClient.getPosts({
      page: currentPage,
      limit: 9,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      tag: selectedTag || undefined,
      status: 'published'
    }),
    placeholderData: (previousData) => previousData
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories()
  })

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.getTags()
  })

  const posts = postsData?.posts || []
  const categories = categoriesData?.categories || []
  const tags = tagsData?.tags || []
  const pagination = postsData?.pagination

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedTag('')
    setCurrentPage(1)
  }

  if (postsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Posts</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="posts" />

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
                         <Link href="/" className="inline-flex items-center text-blue-100 hover:text-orange-400 mb-6">
               <ArrowLeft className="h-5 w-5 mr-2" />
               Back to Home
             </Link>
             <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
               Discover <span className="text-yellow-400">Insights</span>
             </h1>
             <p className="text-2xl md:text-3xl text-yellow-400 max-w-4xl mx-auto">
               Explore our collection of articles, tutorials, and insights from the tech world.
             </p>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap gap-4 items-center">
              <Filter className="h-5 w-5 text-gray-400" />
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className="input max-w-xs"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Tag Filter */}
              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value)
                  setCurrentPage(1)
                }}
                className="input max-w-xs"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>

              {(searchQuery || selectedCategory || selectedTag) && (
                <button
                  onClick={handleClearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="card-body">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No posts found</h2>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-outline disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'px-3 py-2 rounded-md text-sm font-medium',
                          page === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      className="btn-outline disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>

             <Footer />
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return null;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Remove /api from the base URL since static files are served directly from the root
    const cleanBaseURL = baseURL.endsWith('/api') ? baseURL.replace('/api', '') : baseURL;
    return imageUrl.startsWith('http') ? imageUrl : `${cleanBaseURL}${imageUrl}`;
  };

  return (
    <article className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {getImageUrl(post.featured_image) && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={getImageUrl(post.featured_image) || ''}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="card-body">
        <div className="flex items-center gap-2 mb-3">
          {post.categories?.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {category.name}
            </span>
          ))}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link href={`/post/${post.slug}`} className="hover:text-primary-600 transition-colors">
            {post.title}
          </Link>
        </h2>
        
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {truncateText(post.excerpt, 150)}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author?.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </div>
          </div>
          
          <Link href={`/post/${post.slug}`} className="flex items-center gap-1 hover:text-primary-600 transition-colors">
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Link>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
            <TagIcon className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-gray-500 hover:text-primary-600"
                >
                  #{tag.name}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  )
} 