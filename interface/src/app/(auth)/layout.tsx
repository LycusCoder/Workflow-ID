"use client"

import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const quotes = [
    "Embrace the future of workplace efficiency",
    "Intelligent tools for modern teams",
    "Where innovation meets productivity"
  ]

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Artistic area */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">WorkFlow ID</h1>
            <p className="text-lg italic">"{randomQuote}"</p>
          </div>
        </div>
        {/* Abstract decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-400/20 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-500/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-indigo-300/30 rounded-full"></div>
      </div>

      {/* Right side - Form area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">WorkFlow ID</h1>
            <p className="text-sm text-slate-600 italic">"{randomQuote}"</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
