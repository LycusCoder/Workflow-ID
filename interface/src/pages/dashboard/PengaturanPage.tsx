import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userApi } from '@/lib/api'
import * as faceapi from 'face-api.js'
import { 
  Cog6ToothIcon,
  UserCircleIcon,
  LockClosedIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export default function PengaturanPage() {
  const { user, updateUser } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'face' | 'preferences'>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isUpdatingFace, setIsUpdatingFace] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null)
  const [faceError, setFaceError] = useState<string | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<number | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    gender: user?.gender || 'other'
  })

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models/'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models/'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models/'),
        ])
        setModelsLoaded(true)
      } catch (error) {
        console.error('Failed to load models:', error)
      }
    }
    loadModels()
  }, [])

  const startDetection = async () => {
    if (!modelsLoaded) {
      setFaceError('Model belum siap, tunggu sebentar...')
      return
    }

    try {
      setIsDetecting(true)
      setFaceError(null)
      setFaceEmbedding(null)

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      detectionIntervalRef.current = window.setInterval(async () => {
        await detectFace()
      }, 500)

    } catch (error: any) {
      setFaceError('Gagal mengakses kamera')
      setIsDetecting(false)
    }
  }

  const stopDetection = () => {
    setIsDetecting(false)
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const detectFace = async () => {
    if (!videoRef.current || !isDetecting) return

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection) {
        const descriptor = Array.from(detection.descriptor)
        setFaceEmbedding(descriptor)
        setFaceError(null)
      } else {
        setFaceError('Wajah tidak terdeteksi')
      }
    } catch (error) {
      console.error('Detection error:', error)
    }
  }

  useEffect(() => {
    return () => {
      stopDetection()
    }
  }, [])

  const handleUpdateProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      setMessage(null)
      
      // Call backend API to update profile
      const response = await userApi.update(user.id, {
        name: profileForm.name,
        email: profileForm.email,
        gender: profileForm.gender
      })
      
      if (response.error) {
        setMessage({ type: 'error', text: response.error })
      } else {
        setMessage({ type: 'success', text: 'Profile berhasil diupdate!' })
        
        // Update local context
        if (updateUser && response.data) {
          updateUser(response.data)
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal update profile.' })
    } finally {
      setLoading(false)
    }
  }

  const startUpdateFace = () => {
    setIsUpdatingFace(true)
    setMessage(null)
    setFaceError(null)
    startDetection()
  }

  const cancelUpdateFace = () => {
    setIsUpdatingFace(false)
    stopDetection()
    setFaceEmbedding(null)
    setFaceError(null)
  }

  const handleUpdateFace = async () => {
    if (!user || !faceEmbedding) return
    try {
      setLoading(true)
      setMessage(null)
      
      const response = await userApi.update(user.id, {
        face_embedding: JSON.stringify(faceEmbedding)
      })
      
      if (response.error) {
        setMessage({ type: 'error', text: response.error })
      } else {
        setMessage({ type: 'success', text: 'Wajah berhasil diperbarui! Sekarang Anda bisa menggunakan face recognition dengan data wajah baru.' })
        stopDetection()
        setIsUpdatingFace(false)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Gagal update wajah. Silakan coba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  // Auto update when face is detected
  useEffect(() => {
    if (isUpdatingFace && faceEmbedding && !loading) {
      handleUpdateFace()
    }
  }, [faceEmbedding, isUpdatingFace])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1200px] mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pengaturan</h1>
        <p className="text-slate-600">Kelola profile dan preferensi aplikasi</p>
      </div>

      {/* Message Banner */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UserCircleIcon className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('face')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'face' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CameraIcon className="w-5 h-5" />
                <span className="font-medium">Face Recognition</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'preferences' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span className="font-medium">Preferensi</span>
              </button>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="border-0 shadow-lg mt-4">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-semibold text-lg text-slate-900">{user?.name}</h3>
              <p className="text-sm text-slate-600">{user?.email}</p>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">User ID</p>
                <p className="text-sm font-mono text-slate-700">#{user?.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Informasi Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Lengkap
                  </label>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Masukkan email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as 'male' | 'female' | 'other' })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                    <option value="other">Lainnya</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Jenis kelamin terdeteksi otomatis saat pendaftaran, tapi bisa diubah di sini
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    ℹ️ Untuk mengubah password, silakan hubungi administrator sistem.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Face Recognition Tab */}
          {activeTab === 'face' && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Update Face Recognition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-4">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Memperbarui data wajah akan mengganti data wajah lama Anda. Pastikan foto wajah baru terlihat jelas dan memiliki pencahayaan yang baik.
                  </p>
                </div>

                {!isUpdatingFace ? (
                  <div className="text-center py-8">
                    <CameraIcon className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-6">Perbarui data wajah untuk face recognition</p>
                    <Button
                      onClick={startUpdateFace}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <CameraIcon className="w-5 h-5 mr-2" />
                      Mulai Update Wajah
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                      {/* Camera Preview */}
                      {isDetecting && (
                        <div className="mb-4 relative">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline
                            muted
                            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                          />
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            LIVE
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        {isDetecting && !faceEmbedding ? (
                          <>
                            <div className="animate-pulse mb-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                                <CameraIcon className="w-8 h-8 text-white" />
                              </div>
                            </div>
                            <p className="text-lg font-semibold text-indigo-900 mb-2">Mendeteksi wajah...</p>
                            <p className="text-sm text-indigo-600">Posisikan wajah di tengah kamera</p>
                            {faceError && (
                              <p className="text-xs text-orange-600 mt-2">⚠️ {faceError}</p>
                            )}
                          </>
                        ) : faceEmbedding ? (
                          <>
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-green-900 mb-2">Wajah terdeteksi! ✅</p>
                            <p className="text-sm text-green-600">Sedang memperbarui data...</p>
                            <div className="mt-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="animate-pulse mb-4">
                              <div className="w-16 h-16 bg-slate-300 rounded-full mx-auto flex items-center justify-center">
                                <CameraIcon className="w-8 h-8 text-slate-500" />
                              </div>
                            </div>
                            <p className="text-lg font-semibold text-slate-900 mb-2">Memulai kamera...</p>
                            <p className="text-sm text-slate-600">Mohon tunggu sebentar</p>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={cancelUpdateFace}
                      variant="outline"
                      className="w-full"
                    >
                      Batal
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Tips untuk hasil terbaik:</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Pastikan pencahayaan cukup terang dan merata</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Hadapkan wajah langsung ke kamera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Jangan memakai kacamata hitam atau topi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Ekspresi wajah netral untuk akurasi terbaik</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Preferensi Aplikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Cog6ToothIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Fitur preferensi sedang dalam pengembangan</p>
                  <p className="text-sm text-slate-500">Coming soon dengan theme customization, notifications, dan lainnya!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}
