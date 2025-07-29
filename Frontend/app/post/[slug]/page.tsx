'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import apiClient from '@/lib/api'
import { formatDate, truncateText } from '@/lib/utils'
import { 
  Calendar, 
  User, 
  Tag as TagIcon, 
  Eye, 
  ArrowLeft,
  Share2,
  BookOpen,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function PostDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: postData, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => apiClient.getPost(slug),
    enabled: !!slug
  })

  const post = postData?.post

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Header */}
        <header className="mb-8">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {post.categories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author?.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>5 min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>1.2k views</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Author Bio */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{post.author?.username}</h3>
              <p className="text-gray-600">
                Passionate about technology and sharing knowledge with the community.
              </p>
            </div>
          </div>
        </div>

        {/* Related Posts Placeholder */}
        <section className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <span className="text-sm text-gray-500">Coming Soon</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                More great content coming soon...
              </h3>
              <p className="text-gray-600 text-sm">
                We're working on bringing you more amazing posts and tutorials.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <span className="text-sm text-gray-500">Coming Soon</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Stay tuned for updates...
              </h3>
              <p className="text-gray-600 text-sm">
                Subscribe to our newsletter to get notified about new posts.
              </p>
            </div>
          </div>
        </section>
      </article>
    </div>
  )
} 