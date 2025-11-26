import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import AuthLayout from '@/components/auth/AuthLayout'
import StepIndicator from '@/components/auth/StepIndicator'
import PersonalInfoStep from '@/components/auth/PersonalInfoStep'
import { isValidEmail, calculatePasswordStrength } from '@/utils/validation'
import { userApi } from '@/lib/api'
import { TOAST_MESSAGES } from '@/constants/config'
import type { RegisterData } from '@/types'

export default function RegisterPage() {
  const { toast } = useToast()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof calculatePasswordStrength> | null>(null)

  const {
    modelsLoaded,
    isScanning,
    status,
    facePositioned,
    countdown,
    videoRef,
    startScanning,
    stopScanning,
    detectFace,
  } = useFaceDetection()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === 'email') {
      if (value && !isValidEmail(value)) {
        setEmailError(TOAST_MESSAGES.VALIDATION.INVALID_EMAIL)
      } else {
        setEmailError('')
      }
    }

    if (field === 'password') {
      if (value) {
        setPasswordStrength(calculatePasswordStrength(value))
      } else {
        setPasswordStrength(null)
      }
    }
  }

  const handleNextStep = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Validasi Error',
        description: TOAST_MESSAGES.VALIDATION.REQUIRED_FIELDS,
      })
      return
    }

    if (!isValidEmail(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'Email Tidak Valid',
        description: TOAST_MESSAGES.VALIDATION.INVALID_EMAIL,
      })
      return
    }

    if (passwordStrength && passwordStrength.strength === 'weak') {
      toast({
        variant: 'destructive',
        title: 'Password Lemah',
        description: TOAST_MESSAGES.VALIDATION.WEAK_PASSWORD,
      })
      return
    }

    // Check email availability before proceeding
    setIsLoading(true)
    try {
      const checkResponse = await userApi.getAll()
      
      if (checkResponse.data) {
        const existingUser = checkResponse.data.find(
          (user: any) => user.email.toLowerCase() === formData.email.toLowerCase()
        )
        
        if (existingUser) {
          toast({
            variant: 'destructive',
            title: 'Email Sudah Terdaftar',
            description: 'Email ini sudah digunakan. Silakan login atau gunakan email lain.',
          })
          setIsLoading(false)
          return
        }
      }

      // Email available, proceed to face scan
      toast({
        title: 'Email Valid!',
        description: 'Silakan scan wajah Anda untuk melanjutkan.',
      })
      setCurrentStep(2)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memverifikasi email. Coba lagi.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFaceCapture = async () => {
    if (!modelsLoaded) {
      toast({
        variant: 'destructive',
        title: 'Belum Siap',
        description: 'Model face detection masih loading...',
      })
      return
    }

    setIsLoading(true)
    try {
      await startScanning()
      
      // Wait for camera stabilization
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const detection = await detectFace()
      
      if (!detection) {
        toast({
          variant: 'destructive',
          title: 'Wajah Tidak Terdeteksi',
          description: TOAST_MESSAGES.FACE.NO_FACE,
        })
        stopScanning()
        setIsLoading(false)
        return
      }

      // Face detected! Now create user with face embedding
      const embeddingArray = Array.from(detection.descriptor)
      const embeddingString = JSON.stringify(embeddingArray)

      toast({
        title: 'Wajah Terdeteksi!',
        description: 'Menyimpan data Anda...',
      })

      const response = await userApi.create({
        name: formData.name,
        email: formData.email,
        face_embedding: embeddingString,
      })

      if (response.error || !response.data) {
        throw new Error(response.error || 'Registration failed')
      }

      stopScanning()
      
      toast({
        title: 'Registrasi Berhasil! 🎉',
        description: `Selamat datang, ${formData.name}!`,
      })

      // Auto login
      setTimeout(() => {
        login(response.data)
      }, 1500)
    } catch (error: any) {
      console.error('❌ Face capture error:', error)
      
      // Check if email already exists error
      if (error.message && error.message.includes('already exists')) {
        toast({
          variant: 'destructive',
          title: 'Email Sudah Terdaftar',
          description: 'Email ini sudah digunakan. Silakan login.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Registrasi Gagal',
          description: TOAST_MESSAGES.NETWORK.ERROR,
        })
      }
      
      stopScanning()
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { title: 'Info Personal', icon: User },
    { title: 'Scan Wajah', icon: Camera },
  ]

  return (
    <AuthLayout title="Daftar WorkFlow ID" subtitle="Buat akun baru untuk memulai">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <AnimatePresence mode="wait">
        {currentStep === 1 ? (
          <PersonalInfoStep
            formData={formData}
            emailError={emailError}
            passwordStrength={passwordStrength}
            showPassword={showPassword}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onNext={handleNextStep}
          />
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Registrasi Wajah</h3>
            <p className="text-slate-600 text-sm">Scan wajah untuk autentikasi</p>

            <div className="relative w-48 h-48 mx-auto">
              {isScanning ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
                  <Camera size={64} className="text-slate-600" />
                </div>
              )}
            </div>

            <p className="text-sm text-slate-600">{status}</p>

            <Button onClick={handleFaceCapture} disabled={isScanning} className="w-full">
              {isScanning ? 'Capturing...' : 'Mulai Scan Wajah'}
            </Button>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center">
        <p className="text-slate-600">Sudah punya akun?</p>
        <Link to="/login" className="text-indigo-600 hover:underline font-medium">
          Login di sini
        </Link>
      </div>
    </AuthLayout>
  )
}
