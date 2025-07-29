'use client'

import { useState, useEffect } from 'react'
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
  ArrowRight, 
  BookOpen, 
  Users, 
  FileText,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Menu,
  X
} from 'lucide-react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">SpeedItViewer</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Home
              </a>
              <a href="#posts" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Posts
              </a>
              <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Contact
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-primary-600"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Home
                </a>
                <a href="#posts" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Posts
                </a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  About
                </a>
                <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  Contact
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-yellow-400">SpeedItViewer</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Discover the latest insights, tutorials, and stories from the world of technology and development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#posts"
                className="btn bg-yellow-600 text-dark-900 hover:bg-yellow-700 px-8 py-3 text-lg font-semibold"
              >
                Explore Posts
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#about"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{posts.length}+</h3>
              <p className="text-gray-600">Published Posts</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{categories.length}+</h3>
              <p className="text-gray-600">Categories</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Growing</h3>
              <p className="text-gray-600">Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section id="posts" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Posts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest articles, tutorials, and insights from the tech world.
            </p>
          </div>

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

      {/* About Section */}
      <section id="about" className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About SpeedItViewer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're passionate about sharing knowledge and insights from the world of technology, 
              development, and innovation. Our mission is to help developers and tech enthusiasts 
              stay ahead of the curve.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Content</h3>
              <p className="text-gray-600">
                We focus on delivering high-quality, well-researched content that provides real value to our readers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Our community of developers and tech enthusiasts helps shape the content we create.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Latest Trends</h3>
              <p className="text-gray-600">
                Stay updated with the latest trends, tools, and technologies in the ever-evolving tech landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">SpeedItViewer</h3>
              <p className="text-gray-300 mb-4 max-w-md">
                Your go-to destination for the latest insights, tutorials, and stories from the world of technology and development.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-300 hover:text-yellow-400 transition-colors">Home</a></li>
                <li><a href="#posts" className="text-gray-300 hover:text-yellow-400 transition-colors">Posts</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-yellow-400 transition-colors">About</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Email: contact@speeditviewer.com</li>
                <li>Follow us on social media</li>
                <li>Subscribe to our newsletter</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 SpeedItViewer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {post.featured_image && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={post.featured_image}
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
          <a href={`/post/${post.slug}`} className="hover:text-primary-600 transition-colors">
            {post.title}
          </a>
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
          
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>View</span>
          </div>
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