"use client"

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()
  const pathname = usePathname()

  // Show loading state
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

  return <>{children}</>
}
