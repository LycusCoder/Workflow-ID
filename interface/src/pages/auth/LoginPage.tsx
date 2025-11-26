import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  VideoCameraIcon, 
  EnvelopeIcon, 
  FingerPrintIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useFaceDetection } from '@/hooks/useFaceDetection'
import AuthLayout from '@/components/auth/AuthLayout'
import ScanningAnimation from '@/components/auth/ScanningAnimation'
import SuccessAnimation from '@/components/auth/SuccessAnimation'
import { isValidEmail } from '@/utils/validation'
import { userApi } from '@/lib/api'
import { TOAST_MESSAGES } from '@/constants/config'

export default function LoginPage() {
  const { toast } = useToast()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loginMethod, setLoginMethod] = useState<'face' | 'email'>('face')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [matchProgress, setMatchProgress] = useState(0)
  const [scanningStatus, setScanningStatus] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    modelsLoaded,
    isScanning,
    status,
    videoRef,
    startScanning,
    stopScanning,
    detectFace,
    matchFace,
  } = useFaceDetection()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Validasi Error',
        description: TOAST_MESSAGES.VALIDATION.REQUIRED_FIELDS,
      })
      return
    }

    if (!isValidEmail(email)) {
      toast({
        variant: 'destructive',
        title: 'Email Tidak Valid',
        description: TOAST_MESSAGES.VALIDATION.INVALID_EMAIL,
      })
      return
    }

    toast({
      title: 'Coming Soon',
      description: 'Email login akan segera tersedia. Gunakan face recognition dulu.',
    })
  }

  const handleFaceLogin = async () => {
    if (!modelsLoaded) {
      toast({
        variant: 'destructive',
        title: 'Belum Siap',
        description: TOAST_MESSAGES.FACE.MODEL_LOADING,
      })
      return
    }

    try {
      await startScanning()
      setMatchProgress(10)
      setScanningStatus('Menghubungkan kamera...')

      // Wait for camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMatchProgress(30)
      setScanningStatus('Mendeteksi wajah Anda...')

      // Detect face
      const detection = await detectFace()
      
      if (!detection) {
        toast({
          variant: 'destructive',
          title: 'Wajah Tidak Terdeteksi',
          description: TOAST_MESSAGES.FACE.NO_FACE,
        })
        stopScanning()
        setMatchProgress(0)
        setScanningStatus('')
        return
      }

      setMatchProgress(50)
      setScanningStatus('Mengambil data pengguna...')

      // Get all users from backend
      const response = await userApi.getAll()
      
      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to fetch users')
      }

      const users = response.data
      setMatchProgress(70)
      setScanningStatus('Memproses data wajah...')

      // Prepare embeddings for matching
      const embeddings: Float32Array[] = []
      const validUsers = users.filter((user: any) => {
        if (user.face_embedding) {
          try {
            const embedding = new Float32Array(JSON.parse(user.face_embedding))
            embeddings.push(embedding)
            return true
          } catch {
            return false
          }
        }
        return false
      })

      if (validUsers.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Tidak Ada User Terdaftar',
          description: 'Belum ada user dengan face recognition. Daftar dulu!',
        })
        stopScanning()
        setMatchProgress(0)
        setScanningStatus('')
        return
      }

      setMatchProgress(90)
      setScanningStatus('Mencocokkan wajah...')

      // Match face
      const matchResult = matchFace(detection.descriptor, embeddings)

      if (matchResult.matched) {
        const matchedUser = validUsers[matchResult.index]
        setMatchProgress(100)
        setScanningStatus('Verifikasi berhasil!')

        // Show success animation
        setSuccessMessage(`Selamat datang kembali, ${matchedUser.name}!`)
        setShowSuccess(true)

        stopScanning()
        
        setTimeout(() => {
          login(matchedUser)
        }, 2000)
      } else {
        toast({
          variant: 'destructive',
          title: 'Wajah Tidak Dikenali',
          description: TOAST_MESSAGES.FACE.MATCH_FAILED,
        })
        stopScanning()
        setMatchProgress(0)
        setScanningStatus('')
      }
    } catch (error) {
      console.error('❌ Face login error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: TOAST_MESSAGES.NETWORK.ERROR,
      })
      stopScanning()
      setMatchProgress(0)
      setScanningStatus('')
    }
  }

  return (
    <AuthLayout
      title="Selamat Datang!"
      subtitle="Login ke akun WorkFlow ID Anda"
    >
      {/* Tab Switcher */}
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
          <FingerPrintIcon className="w-5 h-5" />
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
          <EnvelopeIcon className="w-5 h-5" />
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
                      className="w-full h-full object-cover rounded-full"
                    />
                    {matchProgress > 0 && (
                      <ScanningAnimation 
                        progress={matchProgress} 
                        status={scanningStatus}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-200"
                  >
                    <VideoCameraIcon className="w-16 h-16 text-slate-600" />
                  </motion.div>
                )}
              </div>
              
              {status && !isScanning && (
                <p className="text-slate-600 mb-4 text-sm">{status}</p>
              )}
              
              <Button
                type="button"
                onClick={handleFaceLogin}
                className="w-full"
                disabled={isScanning || !modelsLoaded}
              >
                {isScanning ? 'Scanning...' : 'Login dengan Face ID'}
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center">
        <p className="text-slate-600">Belum punya akun?</p>
        <Link to="/register" className="text-indigo-600 hover:underline font-medium">
          Daftar di sini
        </Link>
      </div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation message={successMessage} />
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
