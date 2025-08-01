'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

interface NavigationProps {
  currentPage?: 'home' | 'posts' | 'about' | 'contact'
}

export default function Navigation({ currentPage = 'home' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (page: string) => currentPage === page

  return (
    <nav className="bg-blue-900 shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <span className="text-2xl mr-2">&lt; /&gt;</span>
                SpeedItViewer
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`transition-colors font-medium ${
                isActive('home') 
                  ? 'text-orange-400' 
                  : 'text-white hover:text-orange-400'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/posts" 
              className={`transition-colors font-medium ${
                isActive('posts') 
                  ? 'text-orange-400' 
                  : 'text-white hover:text-orange-400'
              }`}
            >
              Posts
            </Link>
            <Link 
              href="/about" 
              className={`transition-colors font-medium ${
                isActive('about') 
                  ? 'text-orange-400' 
                  : 'text-white hover:text-orange-400'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`transition-colors font-medium ${
                isActive('contact') 
                  ? 'text-orange-400' 
                  : 'text-white hover:text-orange-400'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-orange-400"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-800">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`transition-colors font-medium ${
                  isActive('home') 
                    ? 'text-orange-400' 
                    : 'text-white hover:text-orange-400'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/posts" 
                className={`transition-colors font-medium ${
                  isActive('posts') 
                    ? 'text-orange-400' 
                    : 'text-white hover:text-orange-400'
                }`}
              >
                Posts
              </Link>
              <Link 
                href="/about" 
                className={`transition-colors font-medium ${
                  isActive('about') 
                    ? 'text-orange-400' 
                    : 'text-white hover:text-orange-400'
                }`}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`transition-colors font-medium ${
                  isActive('contact') 
                    ? 'text-orange-400' 
                    : 'text-white hover:text-orange-400'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 