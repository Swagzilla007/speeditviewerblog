'use client'

import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api'
import { storage } from '@/lib/storage'

interface NavigationProps {
  currentPage?: 'home' | 'posts' | 'about' | 'contact'
}

export default function Navigation({ currentPage = 'home' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    const storedUser = storage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse user from localStorage')
      }
    }
  }, [])

  const isActive = (page: string) => currentPage === page
  
  const handleLogout = () => {
    apiClient.removeAuthToken()
    setUser(null)
    router.push('/')
  }

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
            
            {/* Auth Links - Only show on client side to avoid hydration errors */}
            {isClient && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-medium">{user.username || user.email}</span>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center text-white hover:text-orange-400"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/login" className="text-white hover:text-orange-400">
                      Login
                    </Link>
                    <Link 
                      href="/register"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
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
              
              {/* Mobile Auth Links */}
              {isClient && (
                <div className="pt-4 border-t border-blue-800">
                  {user ? (
                    <>
                      <div className="text-white font-medium mb-2">
                        {user.username || user.email}
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center text-white hover:text-orange-400"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link 
                        href="/login" 
                        className="text-white hover:text-orange-400"
                      >
                        Login
                      </Link>
                      <Link 
                        href="/register"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm transition-colors inline-block w-fit"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 