import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTH_CONFIG, TOAST_MESSAGES } from '@/constants/config'
import { safeJsonParse } from '@/lib/utils'
import type { User, AuthState } from '@/types'
import { useToast } from '@/components/ui/use-toast'

interface AuthContextType extends AuthState {
  login: (user: User, token?: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY)
        const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)

        if (storedUser && storedToken) {
          const user = safeJsonParse<User>(storedUser, null)
          
          if (user) {
            // TODO: Verify token expiration when backend implements JWT
            setAuthState({
              user,
              token: storedToken,
              isAuthenticated: true,
              isLoading: false,
            })
            return
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        // Clear corrupted data
        localStorage.removeItem(AUTH_CONFIG.USER_KEY)
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)
      }

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }

    initializeAuth()
  }, [])

  const login = useCallback((user: User, token?: string) => {
    try {
      // Generate temporary token if not provided (until backend implements JWT)
      const authToken = token || `temp_token_${user.id}_${Date.now()}`

      // Store user and token
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user))
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, authToken)

      setAuthState({
        user,
        token: authToken,
        isAuthenticated: true,
        isLoading: false,
      })

      toast({
        variant: 'success',
        title: 'Login Berhasil!',
        description: `Selamat datang kembali, ${user.name}! 🎉`,
      })

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('❌ Login error:', error)
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Terjadi kesalahan saat login. Coba lagi.',
      })
    }
  }, [navigate, toast])

  const logout = useCallback(() => {
    try {
      // Clear localStorage
      localStorage.removeItem(AUTH_CONFIG.USER_KEY)
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY)

      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })

      toast({
        title: 'Logout Berhasil',
        description: TOAST_MESSAGES.AUTH.LOGOUT_SUCCESS,
      })

      // Navigate to login
      navigate('/login')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }, [navigate, toast])

  const updateUser = useCallback((userData: Partial<User>) => {
    if (!authState.user) return

    const updatedUser = { ...authState.user, ...userData }
    
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(updatedUser))
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }))
  }, [authState.user])

  const checkAuth = useCallback((): boolean => {
    return authState.isAuthenticated && authState.user !== null
  }, [authState.isAuthenticated, authState.user])

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
