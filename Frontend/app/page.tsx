'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api'
import { Post, Category, Tag } from '@/types'
import { formatDate, truncateText, cn } from '@/lib/utils'
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  FileText,
  Calendar,
  User,
  Tag as TagIcon,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import Navigation from './components/Navigation'
import Footer from './components/Footer'

export default function HomePage() {

  // Fetch posts (only 3 most recent)
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['posts', { limit: 3 }],
    queryFn: () => apiClient.getPosts({
      page: 1,
      limit: 3,
      status: 'published'
    })
  })

  // Fetch all posts for stats (just to get total count)
  const {
    data: allPostsData
  } = useQuery({
    queryKey: ['all-posts-stats'],
    queryFn: () => apiClient.getPosts({
      page: 1,
      limit: 1,
      status: 'published'
    })
  })

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories()
  })

  const posts = postsData?.posts || []
  const categories = categoriesData?.categories || []
  const totalPosts = allPostsData?.pagination?.total || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="home" />

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-yellow-400">SpeedItViewer</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover the latest insights, tutorials, and stories from the world of technology and development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/posts"
                className="btn bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold"
              >
                Explore Posts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/about"
                className="btn border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 text-lg font-semibold"
              >
                Learn More
              </Link>
            </div>
            
            {/* Feature Cards in Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="text-xl font-bold text-blue-900">&lt; /&gt;</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Code Support</h3>
                <p className="text-blue-100 text-sm">
                  Get help with your coding challenges and technical issues
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="text-xl font-bold text-blue-900">↑</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Code Sharing</h3>
                <p className="text-blue-100 text-sm">
                  Share your code snippets and solutions with the community
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="text-xl font-bold text-blue-900">↓</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Template Downloads</h3>
                <p className="text-blue-100 text-sm">
                  Access ready-to-use templates for your projects
                </p>
              </div>
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
                               <h3 className="text-2xl font-bold text-gray-900 mb-2">{totalPosts}+</h3>
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
               <h3 className="text-2xl font-bold text-gray-900 mb-2">0</h3>
               <p className="text-gray-600">Users</p>
             </div>
           </div>
         </div>
       </section>

       {/* Posts Section */}
       <section className="py-16">
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

           {/* Posts Grid */}
           {postsLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(3)].map((_, i) => (
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
               <h2 className="text-2xl font-semibold text-gray-900 mb-2">No posts yet</h2>
               <p className="text-gray-600">Check back soon for our latest content.</p>
             </div>
           ) : (
             <>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 {posts.map((post) => (
                   <PostCard key={post.id} post={post} />
                 ))}
               </div>

               {/* Explore Button */}
               <div className="text-center">
                 <Link
                   href="/posts"
                   className="btn bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold inline-flex items-center"
                 >
                   Explore All Posts
                   <ArrowRight className="ml-2 h-5 w-5" />
                 </Link>
               </div>
             </>
           )}
         </div>
       </section>

       {/* About Section */}
       <section className="bg-gray-100 py-16">
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





      <Footer />
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

 