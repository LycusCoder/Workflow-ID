"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, User, ChevronLeft, ChevronRight, Check, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate form
      if (!formData.name || !formData.email || !formData.password) {
        alert('Please fill all fields')
        return
      }

      setIsLoading(true)
      try {
        // Create user
        const response = await fetch('http://localhost:8000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email
          }),
        })

        if (response.ok) {
          const user = await response.json()
          console.log('User created:', user)
          setCurrentStep(2)
        } else {
          const error = await response.json()
          alert(`Registration failed: ${error.detail || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Network error occurred')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(1)
  }

  const handleFaceCapture = () => {
    setIsScanning(true)
    // TODO: Implement face capture with face-api.js
    setTimeout(() => {
      setIsScanning(false)
      alert('Face capture simulation complete!')
    }, 3000)
  }

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
                  placeholder="Enter your email"
                  className="rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
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
                    placeholder="Create a password"
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
