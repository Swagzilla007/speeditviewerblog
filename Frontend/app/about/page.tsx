'use client'

import { 
  BookOpen, 
  Users, 
  FileText,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="about" />

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-blue-100 hover:text-orange-400 mb-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
                         <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
               About <span className="text-yellow-400">SpeedItViewer</span>
             </h1>
             <p className="text-xl text-yellow-400 max-w-3xl mx-auto">
               We're passionate about sharing knowledge and insights from the world of technology, 
               development, and innovation. Our mission is to help developers and tech enthusiasts 
               stay ahead of the curve.
             </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At SpeedItViewer, we believe that knowledge should be accessible to everyone. Our platform serves as a bridge between complex technical concepts and practical implementation, making technology more approachable for developers at all levels.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We're committed to fostering a collaborative environment where developers can share their experiences, learn from each other, and grow together. Whether you're a seasoned professional or just starting your journey in tech, you'll find valuable resources here.
              </p>
              <p className="text-lg text-gray-600">
                Our team of experienced developers and tech enthusiasts work tirelessly to curate and create content that addresses real-world challenges, explores emerging technologies, and provides actionable insights that you can apply to your projects immediately.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">What We Offer</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  In-depth tutorials and guides
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Code snippets and examples
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Industry insights and trends
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Best practices and tips
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Community discussions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Downloadable templates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

             <Footer />
    </div>
  )
} 