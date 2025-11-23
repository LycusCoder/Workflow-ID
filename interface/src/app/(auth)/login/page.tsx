"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Mail, Fingerprint, Eye, EyeOff } from 'lucide-react'
import * as faceapi from 'face-api.js'
import { API_ENDPOINTS } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'face' | 'email'>('face')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState('')
  const [matchProgress, setMatchProgress] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const isScanningRef = useRef<boolean>(false)

  // Load face-api models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 [LOGIN] Loading face detection models...')
        setStatus('Loading face detection models...')
        await faceapi.nets.ssdMobilenetv1.load('/models/')
        await faceapi.nets.faceLandmark68Net.load('/models/')
        await faceapi.nets.faceRecognitionNet.load('/models/')
        
        setModelsLoaded(true)
        setStatus('Ready for face recognition')
        console.log('✅ [LOGIN] Models loaded successfully')
      } catch (error) {
        console.error('❌ [LOGIN] Model loading failed:', error)
        setStatus('Error loading models. Please refresh.')
      }
    }
    loadModels()
  }, [])

  // Cleanup video stream
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📧 [LOGIN] Email login:', email)
    // TODO: Implement email/password authentication
    alert('Email login not yet implemented')
  }

  const handleFaceLogin = async () => {
    if (!modelsLoaded) {
      alert('Models not loaded yet. Please wait.')
      return
    }

    console.log('📷 [LOGIN] Starting face login...')
    setIsScanning(true)
    isScanningRef.current = true
    setStatus('Starting camera...')
    setMatchProgress(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      const video = videoRef.current
      if (!video) {
        setStatus('Video element not found.')
        setIsScanning(false)
        return
      }

      video.srcObject = stream
      await video.play()

      setStatus('Detecting face...')
      console.log('👤 [LOGIN] Camera started, detecting face...')

      // Detect face
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        console.log('❌ [LOGIN] No face detected')
        alert('No face detected. Please try again.')
        stream.getTracks().forEach(track => track.stop())
        setIsScanning(false)
        isScanningRef.current = false
        setStatus('No face detected')
        return
      }

      console.log('✅ [LOGIN] Face detected with score:', detection.detection.score)
      setStatus('Face detected! Matching with database...')
      setMatchProgress(30)

      const descriptor = detection.descriptor
      console.log('🔍 [LOGIN] Fetching registered users...')

      // Get all users from backend
      const response = await fetch(API_ENDPOINTS.users)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const users = await response.json()
      console.log('📊 [LOGIN] Found', users.length, 'registered users')
      setMatchProgress(50)

      // Find matching user
      let matchedUser = null
      let bestMatch = { distance: 1.0, user: null }

      for (const user of users) {
        if (!user.face_embedding) {
          console.log('⏭️ [LOGIN] User', user.name, 'has no face embedding')
          continue
        }

        const storedDescriptor = new Float32Array(JSON.parse(user.face_embedding))
        const distance = faceapi.euclideanDistance(descriptor, storedDescriptor)
        
        console.log('🎯 [LOGIN] User:', user.name, 'Distance:', distance.toFixed(4))

        if (distance < 0.6 && distance < bestMatch.distance) {
          bestMatch = { distance, user }
        }
      }

      setMatchProgress(80)

      if (bestMatch.user) {
        matchedUser = bestMatch.user
        console.log('✅ [LOGIN] Match found! User:', matchedUser.name, 'Distance:', bestMatch.distance.toFixed(4))
        setStatus(`Welcome back, ${matchedUser.name}!`)
        setMatchProgress(100)

        // Stop camera
        stream.getTracks().forEach(track => track.stop())

        // Success - redirect to dashboard
        setTimeout(() => {
          alert(`✅ Login successful! Welcome, ${matchedUser.name}`)
          // TODO: Set authentication state/token
          // For now, just show success
          setIsScanning(false)
          isScanningRef.current = false
        }, 1000)
      } else {
        console.log('❌ [LOGIN] No matching user found')
        alert('Face not recognized. Please register first or try again.')
        stream.getTracks().forEach(track => track.stop())
        setIsScanning(false)
        isScanningRef.current = false
        setStatus('Face not recognized')
        setMatchProgress(0)
      }

    } catch (error) {
      console.error('💥 [LOGIN] Error:', error)
      alert('Failed to access camera or process face. Please try again.')
      setIsScanning(false)
      isScanningRef.current = false
      setStatus('Error occurred')
    }
  }

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
                  {isScanning ? (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-full h-full relative"
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        width="640"
                        height="480"
                        className="w-full h-full object-cover rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="w-40 h-40 border-4 border-indigo-500 rounded-full border-t-transparent"
                        />
                      </div>
                      {matchProgress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-white text-sm rounded-b-full">
                          {matchProgress}% - {status}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-200"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute inset-1 border-2 border-indigo-500 rounded-full border-t-transparent"
                      />
                      <Camera size={64} className="text-slate-600" />
                    </motion.div>
                  )}
                </div>
                {status && !isScanning && (
                  <p className="text-slate-600 mb-4 text-sm">{status}</p>
                )}
                {isScanning && (
                  <p className="text-indigo-600 font-medium mb-4">{status}</p>
                )}
                <Button
                  type="button"
                  onClick={handleFaceLogin}
                  className="w-full rounded-lg"
                  disabled={isScanning || !modelsLoaded}
                >
                  {isScanning ? 'Scanning...' : 'Login with Face ID'}
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
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="rounded-lg pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
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
