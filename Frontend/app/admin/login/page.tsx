'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '@/lib/api'
import { storage } from '@/lib/storage'
import { LoginForm } from '@/types'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginForm) => {
      console.log('Calling API with credentials:', credentials)
      return apiClient.login(credentials)
    },
    onSuccess: (response) => {
      console.log('Login success response:', response)
      if (response.success) {
        apiClient.setAuthToken(response.data.token)
        storage.setItem('user', JSON.stringify(response.data.user))
        toast.success('Login successful!')
        router.push('/admin')
      } else {
        toast.error(response.message || 'Login failed')
      }
    },
    onError: (error: any) => {
      console.log('Login error:', error)
      // Prevent page reload and show specific error message
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid credentials'
      toast.error(errorMessage)
      // Don't redirect or reload the page
    }
  })

  const onSubmit = (data: LoginForm) => {
    console.log('Form submitted with data:', data)
    loginMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-primary-50 opacity-30"></div>
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-dark-900 mb-2">Admin Login</h2>
          <p className="text-sm text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-200 relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-600 rounded-t-xl"></div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-900">
                Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-900">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600 h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting || loginMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 via-yellow-100 to-orange-100 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-dark-900 mb-2 flex items-center">
              <span className="w-2 h-2 bg-dark-900 rounded-full mr-2"></span>
              Demo Credentials:
            </h3>
            <div className="text-sm text-dark-800 space-y-1">
              <p><strong>Email:</strong> wkgayathra@gmail.com</p>
              <p><strong>Password:</strong> gayathra123</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200 font-medium"
            >
              ← Back to Blog
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 