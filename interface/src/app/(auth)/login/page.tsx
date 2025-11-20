"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Mail, Fingerprint } from 'lucide-react'

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'face' | 'email'>('face')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loginMethod === 'email') {
      console.log('Email login:', email, password)
      // TODO: Implement email authentication
    } else {
      setIsScanning(true)
      // TODO: Implement face recognition
    }
  }

  return (
    <div className="w-full">
      <CardHeader className="px-0 py-8">
        <CardTitle className="text-2xl text-center text-slate-900">
          Welcome Back
        </CardTitle>
        <p className="text-center text-slate-600 mt-2">
          Sign in to your WorkFlow ID account
        </p>
      </CardHeader>

      {/* Tab Switcher */}
      <CardContent className="px-0">
        <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all ${
              loginMethod === 'face'
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-600 hover:text-slate-800'
            }`}
            onClick={() => setLoginMethod('face')}
          >
            <Fingerprint size={20} />
            Face ID
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all ${
              loginMethod === 'email'
                ? 'bg-white shadow-sm text-slate-900'
                : 'text-slate-600 hover:text-slate-800'
            }`}
            onClick={() => setLoginMethod('email')}
          >
            <Mail size={20} />
            Email
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {loginMethod === 'face' ? (
            <motion.div
              key="face"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <motion.div
                    animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
                    transition={isScanning ? { repeat: Infinity, duration: 1.5 } : {}}
                    className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-200"
                  >
                    <motion.div
                      animate={isScanning ? { rotate: 360 } : {}}
                      transition={isScanning ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
                      className="absolute inset-1 border-2 border-indigo-500 rounded-full border-t-transparent"
                    />
                    <Camera size={64} className="text-slate-600" />
                  </motion.div>
                </div>
                {isScanning && (
                  <p className="text-indigo-600 font-medium mb-4">Scanning face...</p>
                )}
                <Button
                  type="button"
                  onClick={() => setIsScanning(!isScanning)}
                  className="w-full rounded-lg"
                >
                  {isScanning ? 'Stop Scanning' : 'Start Face Recognition'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg">
                  Sign In
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <p className="text-slate-600">Don't have an account?</p>
          <Link href="/register" className="text-indigo-600 hover:underline font-medium">
            Create one here
          </Link>
        </div>
      </CardContent>
    </div>
  )
}
