"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, User, ChevronLeft, ChevronRight, Check, Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import * as faceapi from 'face-api.js'
import { API_ENDPOINTS } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'

// Password strength calculation
const calculatePasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong', score: number } => {
  let score = 0
  
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 25
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20
  if (/\d/.test(password)) score += 15
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15
  
  if (score <= 40) return { strength: 'weak', score }
  if (score <= 70) return { strength: 'medium', score }
  return { strength: 'strong', score }
}

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function RegisterPage() {
  const { toast } = useToast()
  const { login } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    faceEmbedding: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState('')
  const [faceCaptured, setFaceCaptured] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [facePositioned, setFacePositioned] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [emailError, setEmailError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<{ strength: 'weak' | 'medium' | 'strong', score: number } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isScanningRef = useRef<boolean>(false)
  const countdownRef = useRef<number | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Email validation
    if (field === 'email') {
      if (value && !isValidEmail(value)) {
        setEmailError('Email must be in format: user@domain.com')
      } else {
        setEmailError('')
      }
    }
    
    // Password strength calculation
    if (field === 'password') {
      if (value) {
        setPasswordStrength(calculatePasswordStrength(value))
      } else {
        setPasswordStrength(null)
      }
    }
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate form
      if (!formData.name || !formData.email || !formData.password) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill all required fields"
        })
        return
      }

      // Validate email format
      if (!isValidEmail(formData.email)) {
        toast({
          variant: "destructive",
          title: "Invalid Email",
          description: "Email must be in format: user@domain.com"
        })
        return
      }

      // Check password strength
      if (passwordStrength && passwordStrength.strength === 'weak') {
        toast({
          variant: "warning",
          title: "Weak Password",
          description: "Please use a stronger password for better security"
        })
        return
      }

      console.log('🚀 [REGISTER] Starting user registration...')
      console.log('📝 [REGISTER] Form data:', { name: formData.name, email: formData.email })
      console.log('🌐 [REGISTER] API Endpoint:', API_ENDPOINTS.users)

      setIsLoading(true)
      try {
        // Create user
        console.log('📤 [REGISTER] Sending POST request to backend...')
        const response = await fetch(API_ENDPOINTS.users, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email
          }),
        })

        console.log('📥 [REGISTER] Response received:', response.status, response.statusText)

        if (response.ok) {
          const user = await response.json()
          console.log('✅ [REGISTER] User created successfully:', user)
          console.log('🆔 [REGISTER] User ID:', user.id)
          setUserId(user.id)
          toast({
            variant: "success",
            title: "Success!",
            description: "Account created. Let's capture your face."
          })
          setCurrentStep(2)
        } else {
          const error = await response.json()
          console.error('❌ [REGISTER] Registration failed:', error)
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.detail || 'Unknown error occurred'
          })
        }
      } catch (error) {
        console.error('💥 [REGISTER] Network error:', error)
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Unable to connect to server. Please try again."
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(1)
  }

  // Load face-api models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('Loading face detection models...')
        await faceapi.nets.ssdMobilenetv1.load('/models/')
        setStatus('Loading landmark model...')
        await faceapi.nets.faceLandmark68Net.load('/models/')
        setStatus('Loading recognition model...')
        await faceapi.nets.faceRecognitionNet.load('/models/')

        setModelsLoaded(true)
        setStatus('All models loaded! Ready to scan faces.')
      } catch (error) {
        console.error('Model loading failed:', error)
        setStatus('Error loading models. Please refresh.')
      }
    }
    loadModels()
  }, [])

  const handleFaceCapture = async () => {
    if (!modelsLoaded) {
      toast({
        variant: "warning",
        title: "Not Ready",
        description: "Face detection models are still loading. Please wait."
      })
      return
    }

    console.log('📷 [FACE] Starting face capture...')
    console.log('👤 [FACE] User ID:', userId)

    setIsScanning(true)
    isScanningRef.current = true
    countdownRef.current = null
    setStatus('Starting camera...')
    setFacePositioned(false)
    setFaceCaptured(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      const video = videoRef.current
      if (!video) {
        setStatus('Video element not found.')
        setIsScanning(false)
        return
      }

      video.srcObject = stream

      video.onloadedmetadata = async () => {
        await video.play()

        setStatus('Scanning for face...')

        // Function to check if face is in the guide circle
        const isFaceInCircle = (detectionBox: faceapi.Rect) => {
          const circleCenterX = video.videoWidth / 2;
          const circleCenterY = video.videoHeight / 2;
          const circleRadius = Math.min(video.videoWidth, video.videoHeight) * 0.25; // 25% of min dimension

          const faceCenterX = detectionBox.x + detectionBox.width / 2;
          const faceCenterY = detectionBox.y + detectionBox.height / 2;

          // Calculate distance from circle center
          const distance = Math.sqrt(
            Math.pow(faceCenterX - circleCenterX, 2) +
            Math.pow(faceCenterY - circleCenterY, 2)
          );

          return {
            isInCircle: distance < circleRadius * 0.9, // Face center should be within 90% of circle radius
            distance: distance
          };
        }

        // Start continuous scanning
        const detectLoop = async () => {
          console.log('🔄 [FACE] Detection loop tick - isScanningRef:', isScanningRef.current, 'countdownRef:', countdownRef.current)
          
          if (!isScanningRef.current) {
            console.log('⏸️ [FACE] Detection loop stopped - isScanning is false')
            return
          }

          // Stop detection if countdown has started
          if (countdownRef.current !== null) {
            console.log('⏸️ [FACE] Detection loop paused - countdown in progress:', countdownRef.current)
            return
          }

          try {
            const detection = await faceapi
              .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
              .withFaceLandmarks()
              .withFaceDescriptor()

            if (!detection || detection.detection.score < 0.5) {
              // Reset if face is no longer detectable or moving
              setFacePositioned(false)
              setFaceCaptured(false)
              setCountdown(null)
              countdownRef.current = null
              setStatus("Wajah tidak ditemukan. Pastikan cahaya cukup.")
              return setTimeout(detectLoop, 300)
            }

            const facePosition = isFaceInCircle(detection.detection.box)
            const score = detection.detection.score

            if (score < 0.6) {
              setFacePositioned(false)
              setFaceCaptured(false)
              setCountdown(null)
              countdownRef.current = null
              setStatus('Kualitas wajah kurang jelas. Dekatkan wajah atau cari cahaya.')
              return setTimeout(detectLoop, 300)
            }

            if (!facePosition.isInCircle) {
              setFacePositioned(false)
              setFaceCaptured(false)
              setCountdown(null)
              countdownRef.current = null
              setStatus('Posisikan wajah di dalam lingkaran panduan.')
              return setTimeout(detectLoop, 300)
            }

            // Face is properly positioned
            if (!facePositioned) {
              console.log('✅ [FACE] Face properly positioned, starting countdown...')
              console.log('📊 [FACE] Detection score:', score)
              setFacePositioned(true)
              setStatus('Wajah terdeteksi! Mulai countdown...')
              startCaptureCountdown(detection.descriptor)
              return // Stop this detection loop, countdown will handle the rest
            }

            setTimeout(detectLoop, 300)

          } catch (error) {
            console.error('Detection error:', error)
            setTimeout(detectLoop, 300);
          }
        }

        detectLoop()
      }
    } catch (error) {
      console.error('Camera error:', error)
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions."
      })
      setStatus('Camera access failed.')
      setIsScanning(false)
    }
  }

  // Countdown and capture function
  const startCaptureCountdown = (descriptor: Float32Array) => {
    console.log('⏱️ [COUNTDOWN] Starting 3-2-1 countdown...')
    console.log('🔢 [COUNTDOWN] Descriptor received, length:', descriptor.length)
    setCountdown(3)
    countdownRef.current = 3

    // Start countdown: 3, 2, 1
    const countdownInterval = setInterval(() => {
      console.log('⏱️ [COUNTDOWN] Tick...')
      setCountdown(prev => {
        const newValue = prev === null || prev <= 1 ? null : prev - 1
        countdownRef.current = newValue
        console.log('⏱️ [COUNTDOWN] Current countdown value:', prev, '-> New value:', newValue)
        
        if (prev === null || prev <= 1) {
          console.log('🎯 [COUNTDOWN] Countdown complete!')
          clearInterval(countdownInterval)
          console.log('📸 [CAPTURE] Face captured! Processing...')
          console.log('🔢 [CAPTURE] Descriptor length:', descriptor.length)
          // Capture the face!
          setFaceCaptured(true)
          setStatus('Processing face data...')

          // Save the embedding to backend
          console.log('🚀 [COUNTDOWN] Calling saveFaceEmbedding...')
          saveFaceEmbedding(descriptor)

          return null
        }
        return newValue
      })
    }, 800) // 800ms per count for 3,2,1
  }

  // Save face embedding to backend
  const saveFaceEmbedding = async (descriptor: Float32Array) => {
    console.log('💾 [SAVE] Starting to save face embedding...')
    console.log('🆔 [SAVE] User ID:', userId)

    if (!userId) {
      console.error('❌ [SAVE] User ID not found!')
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID not found. Please try registration again."
      })
      setIsScanning(false)
      return
    }

    try {
      const embeddingArray = Array.from(descriptor)
      const embeddingString = JSON.stringify(embeddingArray)
      console.log('📦 [SAVE] Embedding array length:', embeddingArray.length)
      console.log('📦 [SAVE] Embedding string length:', embeddingString.length)
      console.log('🌐 [SAVE] API URL:', `${API_ENDPOINTS.users}/${userId}`)
      
      console.log('📤 [SAVE] Sending PUT request to backend...')
      const response = await fetch(`${API_ENDPOINTS.users}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          face_embedding: embeddingString
        }),
      })

      console.log('📥 [SAVE] Response status:', response.status, response.statusText)

      if (response.ok) {
        const updatedUser = await response.json()
        console.log('✅ [SAVE] Face embedding saved successfully!')
        console.log('👤 [SAVE] Updated user:', updatedUser)
        
        // Update local state
        setFormData(prev => ({
          ...prev,
          faceEmbedding: embeddingString,
        }))

        // Stop camera
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
          console.log('📷 [SAVE] Camera stopped')
        }

        console.log('🎉 [SAVE] Registration complete! Redirecting to login...')
        toast({
          variant: "success",
          title: "Registration Complete!",
          description: "Logging you in..."
        })
        setTimeout(() => {
          setIsScanning(false)
          isScanningRef.current = false
          setFacePositioned(false)
          setCountdown(null)
          countdownRef.current = null
          // Auto-login after registration
          login(updatedUser)
        }, 2000)
      } else {
        const error = await response.json()
        console.error('❌ [SAVE] Failed to save face data:', error)
        console.error('📄 [SAVE] Error detail:', error.detail)
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: error.detail || 'Failed to save face data'
        })
        setIsScanning(false)
        setFaceCaptured(false)
      }
    } catch (error) {
      console.error('💥 [SAVE] Network error:', error)
      console.error('📋 [SAVE] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to save face data. Please try again."
      })
      setIsScanning(false)
      setFaceCaptured(false)
    }
  }

  // Cleanup video stream when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Face Capture', icon: Camera }
  ]

  return (
    <div className="w-full">
      <CardHeader className="px-0 py-8">
        <CardTitle className="text-2xl text-center text-slate-900">
          Join WorkFlow ID
        </CardTitle>
        <p className="text-center text-slate-600 mt-2">
          Set up your account for seamless workplace management
        </p>
      </CardHeader>

      <CardContent className="px-0">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            const isCompleted = index + 1 < currentStep
            const isCurrent = index + 1 === currentStep

            return (
              <div key={index} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: isCompleted
                      ? '#22c55e' // green-500
                      : isCurrent
                      ? '#6366f1' // indigo-500
                      : '#cbd5e1', // slate-300
                    scale: isCurrent ? 1.05 : 1
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                >
                  {isCompleted ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <IconComponent size={16} className={isCurrent ? 'text-white' : 'text-slate-600'} />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div
                    animate={{ backgroundColor: isCompleted ? '#22c55e' : '#cbd5e1' }}
                    className="w-12 h-1 mx-2 rounded"
                  />
                )}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="user@domain.com"
                  className={`rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                    emailError ? 'border-red-500' : ''
                  }`}
                />
                {emailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 mt-1 text-red-500 text-sm"
                  >
                    <AlertCircle size={14} />
                    <span>{emailError}</span>
                  </motion.div>
                )}
                {formData.email && !emailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 mt-1 text-green-500 text-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span>Valid email format</span>
                  </motion.div>
                )}
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordStrength && formData.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.score}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${
                            passwordStrength.strength === 'weak' ? 'bg-red-500' :
                            passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        />
                      </div>
                      {passwordStrength.strength === 'weak' && <XCircle size={16} className="text-red-500" />}
                      {passwordStrength.strength === 'medium' && <AlertCircle size={16} className="text-yellow-500" />}
                      {passwordStrength.strength === 'strong' && <CheckCircle2 size={16} className="text-green-500" />}
                    </div>
                    <p className={`text-sm font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-red-500' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      Password strength: {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Use 8+ characters, mix uppercase & lowercase, add numbers and symbols
                    </p>
                  </motion.div>
                )}
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full rounded-lg flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Next Step
                    <ChevronRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Face Registration</h3>
                <p className="text-slate-600">Let's capture your face for secure authentication</p>
              </div>

              <div className="relative w-48 h-48 mx-auto mb-6">
                {isScanning ? (
                  <motion.div
                    className="w-full h-full relative"
                    animate={faceCaptured ? { scale: 1.05 } : {}}
                    transition={{ duration: 0.3 }}
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
                    {/* Circular guide overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-32 h-32 border-4 rounded-full ${
                        faceCaptured ? 'border-green-500' : 'border-indigo-500 border-dashed'
                      }`}
                      style={{
                        backgroundColor: 'transparent',
                        boxShadow: faceCaptured
                          ? '0 0 20px rgba(34, 197, 94, 0.3)'
                          : '0 0 20px rgba(99, 102, 241, 0.3)'
                      }}
                      />
                    </div>
                    {/* Status overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-center text-white text-sm rounded-b-full">
                      {faceCaptured ? '✓ Face Captured' :
                       countdown !== null ? `Capturing in ${countdown}...` :
                       facePositioned ? 'Stay still!' : 'Position your face in the circle'}
                    </div>

                    {/* Countdown overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                        <motion.div
                          key={countdown}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-6xl font-bold text-white"
                        >
                          {countdown}
                        </motion.div>
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

              {isScanning && (
                <p className="text-indigo-600 font-medium mb-4">Capturing face...</p>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleFaceCapture}
                  className="w-full rounded-lg"
                  disabled={isScanning}
                >
                  {isScanning ? 'Capturing...' : 'Start Face Capture'}
                </Button>
                <Button
                  onClick={handlePreviousStep}
                  variant="outline"
                  className="w-full rounded-lg flex items-center justify-center"
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Back to Details
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
          <p className="text-slate-600">Already have an account?</p>
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in here
          </Link>
        </div>
      </CardContent>
    </div>
  )
}
